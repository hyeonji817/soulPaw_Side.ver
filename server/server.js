import "dotenv/config";
import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { pool, query, withTransaction } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

const toProduct = (row, options = [], images = []) => ({
  id: Number(row.id),
  slug: row.slug,
  productTable: row.product_table,
  pname: row.name,
  manufacturer: row.manufacturer,
  category: row.category,
  public: row.origin,
  price: Number(row.price),
  discountPrice: Number(row.discount_price),
  discountRate: Number(row.discount_rate),
  mileage: Number(row.mileage),
  stock: Number(row.stock),
  options: options.map((option) => ({
    id: Number(option.id),
    value: option.value,
    label: option.label,
    priceDelta: Number(option.price_delta),
  })),
  images: images.map((image) => ({
    id: Number(image.id),
    role: image.role,
    assetPath: image.asset_path,
    alt: image.alt,
  })),
});

const loadProduct = async (slug, db = pool) => {
  const productResult = await db.query(
    `SELECT *
     FROM products
     WHERE slug = $1 AND status = 'active'`,
    [slug],
  );

  if (productResult.rowCount === 0) return null;

  const product = productResult.rows[0];
  const [optionsResult, imagesResult] = await Promise.all([
    db.query(
      `SELECT *
       FROM product_options
       WHERE product_id = $1
       ORDER BY sort_order, id`,
      [product.id],
    ),
    db.query(
      `SELECT *
       FROM product_images
       WHERE product_id = $1
       ORDER BY role, sort_order, id`,
      [product.id],
    ),
  ]);

  return toProduct(product, optionsResult.rows, imagesResult.rows);
};

const findOption = (product, optionId) => {
  const selectedOption = product.options.find((option) => option.id === Number(optionId));
  if (!selectedOption) {
    const error = new Error("선택한 옵션을 찾을 수 없습니다.");
    error.status = 400;
    throw error;
  }

  return selectedOption;
};

const calculateLineItem = (product, optionId, quantity) => {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > product.stock) {
    const error = new Error("주문 수량이 올바르지 않습니다.");
    error.status = 400;
    throw error;
  }

  const option = findOption(product, optionId);
  const unitPrice = Math.max(0, product.discountPrice + option.priceDelta);

  return {
    option,
    quantity: qty,
    unitPrice,
    totalPrice: unitPrice * qty,
  };
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/products", async (req, res, next) => {
  try {
    const category = req.query.category;
    const params = [];
    const where = ["status = 'active'"];

    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }

    const result = await query(
      `SELECT *
       FROM products
       WHERE ${where.join(" AND ")}
       ORDER BY id`,
      params,
    );

    res.json({
      products: result.rows.map((row) => toProduct(row)),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:slug", async (req, res, next) => {
  try {
    const product = await loadProduct(req.params.slug);

    if (!product) {
      res.status(404).json({ message: "상품을 찾을 수 없습니다." });
      return;
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

app.post("/api/cart/items", async (req, res, next) => {
  try {
    const { userKey = "guest", productSlug, optionId, quantity } = req.body;
    const product = await loadProduct(productSlug);

    if (!product) {
      res.status(404).json({ message: "상품을 찾을 수 없습니다." });
      return;
    }

    const lineItem = calculateLineItem(product, optionId, quantity);
    const item = await withTransaction(async (client) => {
      const cartResult = await client.query(
        `INSERT INTO carts (user_key)
         VALUES ($1)
         ON CONFLICT (user_key) DO UPDATE SET updated_at = now()
         RETURNING id`,
        [userKey],
      );

      const cartId = cartResult.rows[0].id;
      const itemResult = await client.query(
        `INSERT INTO cart_items (
           cart_id, product_id, option_id, quantity, unit_price, total_price
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [cartId, product.id, lineItem.option.id, lineItem.quantity, lineItem.unitPrice, lineItem.totalPrice],
      );

      return itemResult.rows[0];
    });

    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

app.post("/api/wishlist/toggle", async (req, res, next) => {
  try {
    const { userKey = "guest", productSlug } = req.body;
    const product = await loadProduct(productSlug);

    if (!product) {
      res.status(404).json({ message: "상품을 찾을 수 없습니다." });
      return;
    }

    const toggled = await withTransaction(async (client) => {
      const deleted = await client.query(
        `DELETE FROM wishlists
         WHERE user_key = $1 AND product_id = $2
         RETURNING id`,
        [userKey, product.id],
      );

      if (deleted.rowCount > 0) return false;

      await client.query(
        `INSERT INTO wishlists (user_key, product_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [userKey, product.id],
      );

      return true;
    });

    res.json({ wished: toggled });
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders", async (req, res, next) => {
  try {
    const {
      userKey = "guest",
      productSlug,
      optionId,
      quantity,
      receiverName = "상세페이지 바로구매",
      receiverPhone = "01000000000",
      postalCode = "00000",
      address1 = "주문서에서 입력 필요",
    } = req.body;

    const product = await loadProduct(productSlug);
    if (!product) {
      res.status(404).json({ message: "상품을 찾을 수 없습니다." });
      return;
    }

    const lineItem = calculateLineItem(product, optionId, quantity);
    const order = await withTransaction(async (client) => {
      const tossOrderId = `soulpaw-${crypto.randomUUID()}`;
      const orderResult = await client.query(
        `INSERT INTO orders (
           user_key, toss_order_id, receiver_name, receiver_phone, postal_code,
           address1, total_product_amount, shipping_fee, total_payment_amount
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $7)
         RETURNING *`,
        [userKey, tossOrderId, receiverName, receiverPhone, postalCode, address1, lineItem.totalPrice],
      );

      await client.query(
        `INSERT INTO order_items (
           order_id, product_id, option_id, product_name, option_label,
           unit_price, quantity, total_price
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orderResult.rows[0].id,
          product.id,
          lineItem.option.id,
          product.pname,
          lineItem.option.label,
          lineItem.unitPrice,
          lineItem.quantity,
          lineItem.totalPrice,
        ],
      );

      return orderResult.rows[0];
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

app.post("/api/payments/prepare", async (req, res, next) => {
  try {
    const orderResponse = await fetch(`http://localhost:${port}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const payload = await orderResponse.json();

    if (!orderResponse.ok) {
      res.status(orderResponse.status).json(payload);
      return;
    }

    res.status(201).json({
      order: payload.order,
      payment: {
        method: "CARD",
        amount: {
          currency: "KRW",
          value: Number(payload.order.total_payment_amount),
        },
        orderId: payload.order.toss_order_id,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = error.status ?? 500;
  res.status(status).json({
    message: status === 500 ? "서버 오류가 발생했습니다." : error.message,
  });
});

app.listen(port, () => {
  console.log(`SoulPaw API server listening on http://localhost:${port}`);
});
