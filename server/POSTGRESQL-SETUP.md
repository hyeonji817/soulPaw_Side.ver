# PostgreSQL + DBeaver 연결

## 1. PostgreSQL 설치

https://www.postgresql.org/download/windows/ 의 공식 Windows 설치 안내에서 설치 프로그램을 받습니다.
PostgreSQL Server를 설치하고, 포트는 5432로 지정하고 postgres 사용자의 비밀번호를 기억하세요.
DBeaver는 DB에 접속하는 도구이므로 PostgreSQL Server가 별도로 실행되어야 합니다.

## 2. DBeaver 연결과 DB 생성

DBeaver에서 PostgreSQL 새 연결을 만듭니다.

| 항목 | 값 |
| --- | --- |
| Host | 127.0.0.1 |
| Port | 5432 |
| Database | postgres (처음 DB 생성용) |
| Username | postgres |
| Password | 설치할 때 지정한 비밀번호 |

연결 테스트 후 postgres 연결의 SQL 편집기에서 아래 문장 하나를 실행합니다.

```sql
CREATE DATABASE soulpaw;
```

이미 soulpaw DB가 있다면 생성하지 않습니다. 이후 Database를 soulpaw로 지정한 새 연결을 만듭니다.

## 3. 서버 환경 설정

server/.env의 PGPASSWORD를 설치 시 지정한 실제 비밀번호로 바꾸세요.
이 구성은 PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD를 사용합니다.
별도로 DATABASE_URL을 설정하면 그 URL이 우선하므로 예전 localhost 연결 문자열을 함께 설정하지 마세요.
비밀번호에 # 문자가 있으면 PGPASSWORD="비밀번호"처럼 따옴표로 감싸세요.

## 4. 테이블 및 초기 상품 등록

서버 폴더에서 실행합니다.

```powershell
cd D:\hyeonji\react\soulPaw\server
node init-db.js
```

이 명령은 DB 자체를 생성하지 않습니다. 앞 단계에서 soulpaw DB를 먼저 생성해야 합니다.
테이블을 만들고, 상품이 없는 DB에만 초기 상품 11개와 옵션·이미지 경로를 등록합니다.
기존 상품이 있으면 초기 데이터 등록을 건너뛰므로 기존 가격·재고를 덮어쓰지 않습니다.

## 5. 기존 방식으로 실행

첫 번째 터미널:

```powershell
cd D:\hyeonji\react\soulPaw\server
npx nodemon server.js
```

두 번째 터미널:

```powershell
cd D:\hyeonji\react\soulPaw\client
npm run dev
```

http://localhost:5173/airmesh 에서 상품 표시를 확인하세요.
서버를 실행한 뒤 http://localhost:4000/api/products/air-mesh-cool-pad 에서 상품 JSON도 확인할 수 있습니다.

## 6. DBeaver에서 확인

soulpaw 연결의 public → Tables를 새로 고침하고 아래 쿼리를 실행하세요.

```sql
SELECT id, slug, name, price, stock FROM products ORDER BY id;
SELECT * FROM product_options ORDER BY id;
SELECT * FROM product_images ORDER BY id;
SELECT * FROM cart_items ORDER BY id;
```

앱과 DBeaver는 같은 DB를 사용합니다. 앱에서 옵션을 선택해 장바구니에 담은 뒤
DBeaver에서 cart_items 데이터를 새로 조회하면 저장 결과를 확인할 수 있습니다.
DBeaver에서 수정한 데이터는 커밋한 뒤 앱 페이지를 새로 고침해야 반영됩니다.

## 변경 범위와 검증 제한

web-output.zip과 클라이언트 코드는 변경하지 않았습니다.
server/env.js, init-db.js, .env.example, 이 안내서를 추가하고 server/db.js와
server/server.js의 환경 설정 로딩, seed.sql의 모호한 컬럼 참조만 수정했습니다.
변경 전 세 소스 파일은 server/postgres-setup-backup에 보관됩니다.
PostgreSQL 설치 및 실제 비밀번호 설정 전에는 DB 연결과 화면 표시를 검증할 수 없습니다.
