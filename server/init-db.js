import "./env.js";
import { readFile } from "node:fs/promises";
import { pool } from "./db.js";

let client;
let inTransaction = false;
try {
  client = await pool.connect();
  await client.query("BEGIN");
  inTransaction = true;
  await client.query(await readFile(new URL("./schema.sql", import.meta.url), "utf8"));
  const { rows } = await client.query("SELECT count(*)::int AS count FROM products");
  if (rows[0].count === 0) {
    await client.query(await readFile(new URL("./seed.sql", import.meta.url), "utf8"));
    console.log("초기 상품 데이터를 등록했습니다.");
  } else {
    console.log("기존 상품이 있어 초기 데이터 등록을 건너뜁니다.");
  }
  await client.query("COMMIT");
  inTransaction = false;
  const result = await client.query("SELECT count(*)::int AS count FROM products");
  console.log(`DB 초기화 완료: 상품 ${result.rows[0].count}개`);
} catch (error) {
  if (client && inTransaction) await client.query("ROLLBACK").catch(() => {});
  console.error("DB 초기화 실패:", error.code ?? error.name);
  console.error("PostgreSQL 실행 상태, soulpaw DB 생성 여부, server/.env 접속 정보를 확인하세요.");
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
