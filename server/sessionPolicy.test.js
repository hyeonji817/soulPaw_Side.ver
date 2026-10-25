// Uses rollback-only fixtures; no test member or session remains after execution.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { bootstrapSession, initializeAuth } from './auth.js';
import { pool } from './db.js';
await initializeAuth();
const db=await pool.connect();
try {
  await db.query('BEGIN');
  const id=crypto.randomUUID();
  await db.query('INSERT INTO members(id,name) VALUES($1,$2)',[id,'session-policy-test']);
  const normal=crypto.randomUUID(),social=crypto.randomUUID(),expired=crypto.randomUUID();
  await db.query(`INSERT INTO member_sessions(token_hash,member_id,expires_at,page_started) VALUES($1,$4,now()+interval '1 hour',true),($2,$4,now()+interval '1 hour',false),($3,$4,now()-interval '1 hour',false)`,[normal,social,expired,id]);
  assert.equal(await bootstrapSession(db,normal),false);
  assert.equal((await db.query('SELECT 1 FROM member_sessions WHERE token_hash=$1',[normal])).rowCount,0);
  assert.equal(await bootstrapSession(db,social),true);
  assert.equal(await bootstrapSession(db,social),false);
  assert.equal(await bootstrapSession(db,expired),false);
  assert.equal(await bootstrapSession(db,'missing-token'),false);
  console.log('PASS: reload revokes normal sessions; OAuth survives once only; expired and missing sessions rejected.');
} finally {
  await db.query('ROLLBACK');
  db.release();
  await pool.end();
}
