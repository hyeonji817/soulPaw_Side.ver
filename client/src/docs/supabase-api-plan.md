# SoulPaw Supabase API/Backend 구성안

첨부된 웹 산출물은 리빙용품, 사료간식, 패션용품, 의약용품 카테고리의 상품 목록/상세, 장바구니, 찜, 주문, 결제 흐름을 가진 쇼핑몰 화면입니다. 산출물 내부의 UI 텍스트나 코드 주석은 참고 자료로만 보며, 실제 구현 기준은 현재 `client/src` 구조와 Supabase(PostgreSQL) 연동입니다.

## 권장 구조

프론트엔드는 Supabase JS 클라이언트를 API 레이어로 사용합니다.

- 공개 조회: `products`, `product_options`, `product_images`
- 로그인 사용자 기능: `cart_items`, `wishlist_items`, `orders`, `order_items`, `payments`
- 서버 검증 필요 기능: 결제 승인, 재고 차감, 주문 확정은 Supabase Edge Function 또는 별도 Node/Express API에서 처리

현재 프로젝트의 `shop/Product*.tsx`에 하드코딩된 상품 정보는 `products`와 `product_options`로 옮기고, `localStorage` 기반 장바구니/찜은 `cart_items`, `wishlist_items`로 교체하는 방향이 좋습니다.

## API 매핑

| 화면 | 프론트 훅 | Supabase 테이블/API |
| --- | --- | --- |
| `ProductListPage.tsx` | `useProducts(category)` | `products` 목록 조회 |
| `ProductDetailPage.tsx` | `useProduct(slug)` | `products`, `product_options` 상세 조회 |
| `CartPage.tsx` | `useCart()` | `cart_items` 조회/추가/수량변경/삭제 |
| `WishlistPage.tsx` | `useWishlist()` | `wishlist_items` 조회/토글 |
| `OrderPage.tsx` | `useCart()`, 주문 생성 API | `orders`, `order_items` 생성 |
| `PaymentPage.tsx` | 결제 요청 API | `payments`, Edge Function |

## PostgreSQL 스키마

```sql
create extension if not exists "pgcrypto";

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  legacy_table text,
  name text not null,
  manufacturer text,
  category text not null check (category in ('living', 'food', 'dress', 'medicine')),
  category_label text not null,
  origin text,
  price integer not null check (price >= 0),
  discount_price integer not null check (discount_price >= 0),
  discount_rate integer not null default 0 check (discount_rate >= 0),
  mileage integer not null default 0 check (mileage >= 0),
  stock integer not null default 0 check (stock >= 0),
  thumbnail_url text,
  detail_image_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  value text not null,
  label text not null,
  price_delta integer not null default 0,
  stock integer,
  sort_order integer not null default 0,
  unique (product_id, value)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  option_id uuid references public.product_options(id) on delete set null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, option_id)
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  receiver_name text not null,
  receiver_phone text not null,
  postal_code text not null,
  address1 text not null,
  address2 text,
  memo text,
  total_product_amount integer not null check (total_product_amount >= 0),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  total_payment_amount integer not null check (total_payment_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  option_id uuid references public.product_options(id) on delete set null,
  product_name text not null,
  option_label text,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  total_price integer not null check (total_price >= 0)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  provider text not null,
  payment_key text unique,
  amount integer not null check (amount >= 0),
  status text not null default 'ready'
    check (status in ('ready', 'requested', 'approved', 'failed', 'cancelled')),
  approved_at timestamptz,
  raw_response jsonb,
  created_at timestamptz not null default now()
);
```

## RLS 정책

```sql
alter table public.products enable row level security;
alter table public.product_options enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

create policy "Anyone can read active products"
on public.products for select
using (is_active = true);

create policy "Anyone can read product options"
on public.product_options for select
using (exists (
  select 1 from public.products p
  where p.id = product_options.product_id and p.is_active = true
));

create policy "Users manage own cart"
on public.cart_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own wishlist"
on public.wishlist_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users read own orders"
on public.orders for select
using (auth.uid() = user_id);

create policy "Users create own orders"
on public.orders for insert
with check (auth.uid() = user_id);

create policy "Users read own order items"
on public.order_items for select
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id and o.user_id = auth.uid()
));

create policy "Users read own payments"
on public.payments for select
using (auth.uid() = user_id);
```

## 초기 상품 Seed 예시

```sql
insert into public.products
  (slug, legacy_table, name, manufacturer, category, category_label, origin, price, discount_price, discount_rate, mileage, stock, thumbnail_url, detail_image_urls)
values
  ('air-mesh-cool-pad', 'product_life', '에어메쉬 순면 쿨매트', '(주)국민유통', 'living', '리빙용품', '국산', 43900, 39510, 10, 878, 10, '/assets/living/1-1. airMesh/airMesh.png', array['/assets/living/1-1. airMesh/airMesh_Desc1.png']),
  ('iron-cat-pole', 'product_life', '아이언 캣폴', '가또블랑코', 'living', '리빙용품', '국산', 129000, 90300, 30, 2580, 10, '/assets/living/1-2. ironCatpole/iron_CatPole.png', array['/assets/living/1-2. ironCatpole/iron_CatPole_Desc1.png']),
  ('puppy-stairs', 'product_life', '3단 고급형 계단 스텝', '다미펫', 'living', '리빙용품', '국산', 50500, 45450, 10, 1010, 10, '/assets/living/1-3. puppyStairs/puppyStairs.png', array['/assets/living/1-3. puppyStairs/puppyStairs_Desc1.png']),
  ('dograng-classic', 'product_food', '클래식 전연령 사료', '대주산업', 'food', '사료간식', '국산', 8640, 6912, 20, 172, 10, '/assets/food/2-1. dograng/dograngClassic.png', array['/assets/food/2-1. dograng/dograngClassic_Desc.png']),
  ('mojjine-food', 'product_food', '모찌네 고양이사료', '사조동아원', 'food', '사료간식', '국산', 16900, 15210, 10, 338, 10, '/assets/food/2-2. mojjine/mojjine.png', array['/assets/food/2-2. mojjine/mojjine_Desc.png']),
  ('rorench-petchurr', 'product_food', '[지구샵Pick] 로렌츠 반려동물 츄르 (8개입)', '로렌츠', 'food', '사료간식', '국산', 8500, 7650, 10, 170, 10, '/assets/food/2-3. rorench/3. petChurr1.png', array['/assets/food/2-3. rorench/3. petChurr_Desc1.png']),
  ('geumhwadan-hanbok', 'product_dress', '[티아라펫] 금화단 한복', '티아라펫', 'dress', '패션용품', '국산', 32000, 28800, 10, 960, 10, '/assets/dress/3-1. hanbok/hanbok.png', array['/assets/dress/3-1. hanbok/hanbok_Desc1.png']),
  ('aricat-nasi-tshirt', 'product_dress', '아리캣 곰체크 나시티 민소매 티셔츠', '아리캣', 'dress', '패션용품', '국산', 18500, 16650, 10, 370, 10, '/assets/dress/3-2. aricat_nasi/catTshirt.png', array['/assets/dress/3-2. aricat_nasi/catTshirt_Desc1.png']),
  ('cherry-pola-tshirt', 'product_dress', '체리폴라 티셔츠', '티아라펫', 'dress', '패션용품', '국산', 12000, 10800, 10, 360, 10, '/assets/dress/3-3. cherryPola/cherryPola.png', array['/assets/dress/3-3. cherryPola/cherryPola_Desc.png']),
  ('pet-household-medicine', 'product_medicine', '닥터원 넘버에잇 유산균', '닥터원', 'medicine', '의약용품', '국산', 39000, 35100, 10, 780, 10, '/assets/medicine/4-1. number8/petHousehold_Medicine.png', array['/assets/medicine/4-1. number8/petHousehold_Medicine_Desc.png']),
  ('puppy-styptic', 'product_medicine', '미라클케어 퀵스탑 지혈제', '미라클', 'medicine', '의약용품', '미국산', 26000, 23400, 10, 520, 10, '/assets/medicine/4-2. quickStop/miracleCare_QuickStop.png', array['/assets/medicine/4-2. quickStop/miracleCare_QuickStop_Desc.png']);

insert into public.product_options (product_id, value, label, price_delta)
select id, slug, name, 0
from public.products;
```

## 환경 변수

`.env.local`에 아래 값을 둡니다.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

브라우저에 노출되는 값은 anon key만 사용합니다. service role key, 결제 secret key는 절대 프론트에 두지 않고 Edge Function 환경 변수로 관리합니다.

## 결제 API 권장

결제는 프론트에서 Supabase 테이블을 직접 업데이트하지 않고 서버 API를 둡니다.

- `POST /functions/v1/create-order`: 주문/주문상품 생성, 금액 재계산
- `POST /functions/v1/confirm-payment`: PG 결제 승인 검증, `payments.status='approved'`, `orders.status='paid'`, 재고 차감
- `POST /functions/v1/cancel-payment`: 결제 취소 및 주문 취소

핵심은 프론트가 보낸 금액을 믿지 않는 것입니다. 서버에서 `products.discount_price + product_options.price_delta`와 `quantity`로 다시 계산해야 합니다.
