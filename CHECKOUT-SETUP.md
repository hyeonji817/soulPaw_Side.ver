# 소울포우 장바구니·주문서·로그인 적용

상품 상세의 BUY NOW / ADD TO BAG / 결제하기 버튼은 모두 `/cart`로 이동합니다. 장바구니에서 선택상품 또는 전체상품 주문하기를 누르면 `/orderList?cart_ids=...`로 이동합니다. 비회원은 로그인 화면을 거쳐 이전 페이지로 돌아갑니다. 서버는 브라우저가 보내는 사용자 ID 대신 HttpOnly 세션 쿠키를 검증합니다.

## 실행

1. 기존 `server/.env`의 PostgreSQL 연결 설정을 유지합니다.
2. 프로젝트 루트에서 `node server/init-db.js` 실행: 기존 상품은 유지하고 주문자·배송지 컬럼을 추가합니다.
3. `npm run server` 실행합니다. 서버 시작 시 회원/세션/OAuth 상태 테이블이 자동 생성됩니다.
4. client 폴더에서 `npm install` 후 `npm run dev` 실행합니다.
5. 프런트엔드 기본 주소는 `http://localhost:5173`, 서버는 `http://localhost:4000`입니다. 다른 포트를 사용하면 `CLIENT_ORIGIN`과 client의 `VITE_API_BASE_URL`을 함께 바꿉니다. `localhost`와 `127.0.0.1`을 섞지 마세요.

## 카카오·네이버 로그인

`server/.env.example`의 다음 설정을 실제 `server/.env`에 추가합니다. Secret은 서버 환경변수에만 보관합니다.

```dotenv
KAKAO_CLIENT_ID=카카오_REST_API_키
KAKAO_CLIENT_SECRET=카카오_Client_Secret
KAKAO_REDIRECT_URI=http://localhost:4000/api/auth/kakao/callback
NAVER_CLIENT_ID=네이버_Client_ID
NAVER_CLIENT_SECRET=네이버_Client_Secret
NAVER_REDIRECT_URI=http://localhost:4000/api/auth/naver/callback
```

각 개발자 콘솔에 위 콜백 URL을 정확하게 등록하고 로그인 기능을 활성화하세요. 소셜 로그인은 인증 코드 교환 → 프로필 조회 → 회원 생성/조회 → 서버 세션 발급 순서로 처리합니다. OAuth state를 브라우저 쿠키와 DB에서 검증하고 한 번 사용한 state는 폐기합니다. 소셜 서비스에서 이메일 제공에 동의하지 않은 경우 주문서에서 이메일을 입력합니다. 배포 시 HTTPS 주소와 `NODE_ENV=production`을 사용하세요.

공식 문서: [카카오](https://developers.kakao.com/docs/ko/kakaologin/rest-api), [네이버](https://developers.naver.com/docs/login/api/api.md), [주소 검색](https://postcode.map.kakao.com/guide).

## 적용 범위와 제한

- 리싸이프로의 장바구니/주문서 구성을 기준으로 흰 배경, 표, 상품 이미지, 수량 조절, 합계, 주문자·배송지 폼, 결제 정보 사이드바를 구현했습니다. 로그인은 리싸이프로의 CSS를 범위 지정해 사용합니다. 브랜드는 소울포우입니다. 화면이 픽셀 단위로 완전히 같다는 검증은 하지 않았습니다.
- 일반 회원가입/로그인/로그아웃과 카카오·네이버 로그인 API를 구현했습니다. 소셜 서비스 실제 키가 없어 실제 계정 로그인 성공 검증은 하지 않았습니다.
- ID 저장은 지원합니다. 비밀번호는 브라우저에 저장하지 않습니다. 비밀번호 찾기/아이디 찾기, 애플 로그인, 비회원 주문조회는 이번 구현에 포함되지 않았습니다.
- 주문은 서버 DB의 최신 가격/재고로 검증하고 주문 접수 및 재고 차감 후 `pending` 상태로 저장합니다. 결제 승인 기능은 포함하지 않았습니다. 기존 상세페이지의 결제 준비 API는 주문서 우회 구매를 막기 위해 차단했습니다. 실결제 운영 전 결제 승인·취소·미결제 주문의 재고 복원 정책을 연결해야 합니다.
- 쿠폰/보유 적립금 데이터가 소울포우 DB에 없어 임의의 잔액을 표시하지 않고 사용 불가 상태로 표시합니다. 화면의 적립 예정 금액은 상품에 등록된 mileage 기준입니다. 배송비는 5만원 미만 3,000원, 이상 무료입니다.
- 주소 검색은 카카오 우편번호 서비스를 사용하며 직접 입력도 가능합니다.

## 확인 결과

- TypeScript + Vite production build 성공.
- 독립된 PostgreSQL 테스트 DB에서 비회원 주문/결제 준비 차단, 가입/로그인/로그아웃, 장바구니 수량·재고 검증, 회원별 장바구니 접근 제한, 서버 가격 계산, 필수 배송지 검증, 중복 주문 방지, 잘못된 OAuth state 거부 확인.
- 브라우저에서 로그인 → 아이언 캣폴 상세 → 장바구니 → 주문서 확인.
- 테스트는 `TEST_API`, `TEST_ORIGIN`을 지정한 별도 테스트 서버에서 `node server/commerce.test.mjs`로 실행합니다. 테스트 회원과 주문을 생성하므로 운영 DB에서 실행하지 마세요.

## 회원가입 화면 추가

`/account/register`는 리싸이프로의 register.jsx / register.css를 복사한 독립 화면입니다. 브랜드명은 소울포우이며 기존 고정 폭 화면이 작은 화면에서도 잘리지 않도록 반응형 보정을 추가했습니다. 이메일·전체동의·성별·생년월일 입력 연결, 비밀번호 확인, 필수 동의, 주소 검색 및 중복 아이디 오류 처리를 구현했습니다. 생년 목록은 2026년을 추가했습니다.

회원 추가 정보(닉네임·전화·생년월일·성별·주소·필수/선택 동의·동의 시각)는 members.profile JSONB에 저장합니다. 서버 재시작 시 컬럼이 자동 추가되며 기존 회원 데이터는 유지됩니다. 비밀번호는 기존 scrypt 해시 방식으로 저장하며 profile에는 포함되지 않습니다. 가입 성공 시 기존 세션 발급 정책에 따라 로그인 상태로 이전 구매 페이지에 복귀합니다.

원본 이용약관 iframe에는 본문이 없었습니다. 이를 알리는 문구를 표시했으며, 실제 서비스용 약관 본문은 별도 등록해야 합니다. 개인정보 수집·이용 표는 원본 내용을 유지했습니다.

추가 검증: `node --test server/registration.test.js` 통과. 독립 PostgreSQL DB에서 가입 후 로그인, 추가 정보와 동의 값의 실제 저장, 비밀번호 평문 미저장 및 기존 구매 API 회귀 테스트 통과.
