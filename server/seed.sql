INSERT INTO products (
  slug, product_table, name, manufacturer, category, origin,
  price, discount_price, discount_rate, mileage, stock
) VALUES
  ('air-mesh-cool-pad', 'product_life', '에어메쉬 순면 쿨매트', '(주)국민유통', '리빙용품', '국산', 43900, 39510, 10, 878, 10),
  ('iron-cat-pole', 'product_life', '아이언 캣폴', '가또블랑코', '리빙용품', '국산', 129000, 90300, 30, 2580, 10),
  ('puppy-stairs', 'product_life', '3단 고급형 계단 스텝', '다미펫', '리빙용품', '국산', 50500, 45450, 10, 1010, 10)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  manufacturer = EXCLUDED.manufacturer,
  category = EXCLUDED.category,
  origin = EXCLUDED.origin,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  discount_rate = EXCLUDED.discount_rate,
  mileage = EXCLUDED.mileage,
  stock = EXCLUDED.stock,
  updated_at = now();

  INSERT INTO product_options (product_id, value, label, price_delta, sort_order)
SELECT id, slug, option_label, 0, sort_order
FROM (
  VALUES
    ('air-mesh-cool-pad', '에어메쉬 순면 쿨패드', 1),
    ('iron-cat-pole', '아이언 캣폴', 1),
    ('puppy-stairs', '펫 스텝!', 1)
) AS seed(slug, option_label, sort_order)
JOIN products ON products.slug = seed.slug
ON CONFLICT (product_id, value) DO UPDATE SET
  label = EXCLUDED.label,
  price_delta = EXCLUDED.price_delta,
  sort_order = EXCLUDED.sort_order;

INSERT INTO product_images (product_id, role, asset_path, alt, sort_order)
SELECT products.id, seed.role, seed.asset_path, seed.alt, seed.sort_order
FROM (
  VALUES
    ('air-mesh-cool-pad', 'main', 'living/1-1. airMesh/airMesh.png', '매쉬 쿨매트', 1),
    ('air-mesh-cool-pad', 'detail', 'living/1-1. airMesh/airMesh_Desc1.png', '에어메쉬 순면 쿨매트 상세 이미지', 1),
    ('iron-cat-pole', 'main', 'living/1-2. ironCatpole/iron_CatPole.png', '아이언 캣폴', 1),
    ('iron-cat-pole', 'detail', 'living/1-2. ironCatpole/iron_CatPole_Desc1.png', '아이언 캣폴 상세 이미지', 1),
    ('puppy-stairs', 'main', 'living/1-3. puppyStairs/puppyStairs.png', '펫 스텝', 1),
    ('puppy-stairs', 'detail', 'living/1-3. puppyStairs/puppyStairs_Desc1.png', '펫 스텝 상세 이미지', 1)
) AS seed(slug, role, asset_path, alt, sort_order)
JOIN products ON products.slug = seed.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM product_images
  WHERE product_images.product_id = products.id
    AND product_images.role = seed.role
    AND product_images.asset_path = seed.asset_path
);