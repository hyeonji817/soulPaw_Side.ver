INSERT INTO products (
  slug, product_table, name, manufacturer, category, origin,
  price, discount_price, discount_rate, mileage, stock
) VALUES
  ('air-mesh-cool-pad', 'product_life', '에어메쉬 순면 쿨매트', '(주)국민유통', '리빙용품', '국산', 43900, 39510, 10, 878, 10),
  ('iron-cat-pole', 'product_life', '아이언 캣폴', '가또블랑코', '리빙용품', '국산', 129000, 90300, 30, 2580, 10),
  ('puppy-stairs', 'product_life', '3단 고급형 계단 스텝', '다미펫', '리빙용품', '국산', 50500, 45450, 10, 1010, 10),
  ('dograng-classic', 'product_food', '클래식 전연령 사료', '대주산업', '사료간식', '국산', 8640, 6912, 20, 172, 10),
  ('mojjine-food', 'product_food', '모찌네 고양이사료', '사조동아원', '사료간식', '국산', 16900, 15210, 10, 338, 10),
  ('rorench-petchurr', 'product_food', '[지구샵Pick] 로렌츠 반려동물 츄르 (8개입)', '로렌츠', '사료간식', '국산', 8500, 7650, 10, 170, 10),
  ('geumhwadan-hanbok', 'product_dress', '[티아라펫] 금화단 한복', '티아라펫', '패션용품', '국산', 32000, 28800, 10, 960, 10),
  ('aricat-nasi-tshirt', 'product_dress', '아리캣 곰체크 나시티 민소매 티셔츠', '아리캣', '패션용품', '국산', 18500, 16650, 10, 370, 10),
  ('cherry-pola-tshirt', 'product_dress', '체리폴라 티셔츠', '티아라펫', '패션용품', '국산', 12000, 10800, 10, 360, 10),
  ('doctor-one-8', 'product_medicine', '닥터원 넘버에잇 유산균', '닥터원', '의약용품', '국산', 39000, 35100, 10, 780, 10),
  ('quickstop', 'product_medicine', '미라클케어 퀵스탑 지혈제', '미라클케어', '의약용품', '국산', 26000, 23400, 10, 520, 10)
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
    ('puppy-stairs', '펫 스텝!', 1), 
    ('dograng-classic', '클래식 전연령', 1),
    ('mojjine-food', '전연령 고양이 사료', 1),
    ('rorench-petchurr', '로렌츠 반려동물 츄르', 1),
    ('geumhwadan-hanbok', '금화단 한복', 1),
    ('aricat-nasi-tshirt', '아리캣 민소매', 1),
    ('cherry-pola-tshirt', '체리폴라 티셔츠', 1),
    ('doctor-one-8', '반려동물 상비약', 1),
    ('quickstop', '미라클케어 퀵스탑', 1)
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
    ('puppy-stairs', 'detail', 'living/1-3. puppyStairs/puppyStairs_Desc1.png', '펫 스텝 상세 이미지', 1), 
    ('dograng-classic', 'main', 'food/2-1. dograng/dograngClassic.png', '클래식 전연령', 1),
    ('dograng-classic', 'detail', 'food/2-1. dograng/dograngClassic_Desc.png', '클래식 전연령 사료 상세 이미지', 1),
    ('mojjine-food', 'main', 'food/2-2. mojjine/mojjine.png', '모찌네 고양이사료', 1),
    ('mojjine-food', 'detail', 'food/2-2. mojjine/mojjine_Desc.png', '모찌네 고양이사료 상세 이미지', 1),
    ('rorench-petchurr', 'main', 'food/2-3. rorench/3. petChurr1.png', '로렌츠 반려동물 츄르', 1),
    ('rorench-petchurr', 'detail', 'food/2-3. rorench/3. petChurr_Desc1.png', '로렌츠 반려동물 츄르 상세 이미지', 1),
    ('geumhwadan-hanbok', 'main', 'dress/3-1. hanbok/hanbok.png', '금화단 한복', 1),
    ('geumhwadan-hanbok', 'detail', 'dress/3-1. hanbok/hanbok_Desc1.png', '금화단 한복 상세 이미지', 1),
    ('aricat-nasi-tshirt', 'main', 'dress/3-2. aricat_nasi/catTshirt.png', '아리캣 민소매', 1),
    ('aricat-nasi-tshirt', 'detail', 'dress/3-2. aricat_nasi/catTshirt_Desc1.png', '아리캣 민소매 상세 이미지', 1),
    ('cherry-pola-tshirt', 'main', 'dress/3-3. cherryPola/cherryPola.png', '체리폴라 티셔츠', 1),
    ('cherry-pola-tshirt', 'detail', 'dress/3-3. cherryPola/cherryPola_Desc.png', '체리폴라 티셔츠 상세 이미지', 1),
    ('doctor-one-8', 'main', 'medicine/4-1. number8/petHousehold_Medicine.png', '닥터원 넘버에잇 유산균', 1),
    ('doctor-one-8', 'detail', 'medicine/4-1. number8/petHousehold_Medicine_Desc.png', '닥터원 넘버에잇 유산균 상세 이미지', 1),
    ('quickstop', 'main', 'medicine/4-2. quickStop/miracleCare_QuickStop.png', '미라클케어 퀵스탑', 1),
    ('quickstop', 'detail', 'medicine/4-2. quickStop/miracleCare_QuickStop_Desc.png', '미라클케어 퀵스탑 상세 이미지', 1)
) AS seed(slug, role, asset_path, alt, sort_order)
JOIN products ON products.slug = seed.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM product_images
  WHERE product_images.product_id = products.id
    AND product_images.role = seed.role
    AND product_images.asset_path = seed.asset_path
);