// Pure boundary tests: no network, Supabase credentials or database are needed.
// Run with Node 22.18+ / 24: node --experimental-strip-types --test this-file
import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, errorResponse, jsonResponse, readJson, readRawBody, requireEnv, secretsMatch } from '../functions/_shared/response.ts';
import { corsHeaders } from '../functions/_shared/cors.ts';
import { verifySignature } from '../functions/_shared/payment-contract.js';

const environment = new Map();
globalThis.Deno = { env: { get: key => environment.get(key) } };
const request = (body, headers = {}) => new Request('https://test.invalid/function', {
  method: 'POST', body, headers: { 'Content-Type': 'application/json', ...headers },
});

test('typed error preserves status/code and responses forbid caching', async () => {
  const response = errorResponse(new ApiError(403, 'REAL_MONEY_DISABLED', 'Indisponível'));
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ok: false, error: { code: 'REAL_MONEY_DISABLED', message: 'Indisponível' } });
});
test('JSON response keeps explicit allowed origin', () => {
  assert.equal(jsonResponse({ ok: true }, 200, { 'Access-Control-Allow-Origin': 'https://game.invalid' }).headers.get('access-control-allow-origin'), 'https://game.invalid');
});
test('parser accepts only a JSON object', async () => {
  assert.deepEqual(await readJson(request('{"action":"snapshot"}')), { action: 'snapshot' });
  for (const body of ['[]', 'null', '42', '"snapshot"']) {
    await assert.rejects(readJson(request(body)), error => error instanceof ApiError && error.status === 400);
  }
});
test('malformed JSON is rejected', async () => {
  await assert.rejects(readJson(request('{')), error => error.code === 'INVALID_JSON');
});
test('untyped body cannot bypass JSON check', async () => {
  await assert.rejects(readJson(request('{}', { 'Content-Type': 'text/plain' })), error => error.status === 415);
});
test('body size limit applies without trusting declared Content-Length', async () => {
  await assert.rejects(readRawBody(request('0123456789'), 5), error => error.status === 413);
});
test('raw webhook bytes are preserved before validation', async () => {
  const text = '{ "status": "paid" }\r\n';
  assert.equal(new TextDecoder().decode(await readRawBody(request(text))), text);
});
test('CORS reflects a configured exact origin', () => {
  environment.set('ALLOWED_ORIGINS', 'https://game.invalid,capacitor://localhost');
  const headers = corsHeaders(new Request('https://test.invalid', { headers: { Origin: 'https://game.invalid' } }));
  assert.equal(headers['Access-Control-Allow-Origin'], 'https://game.invalid');
  assert.equal(headers.Vary, 'Origin');
});
test('CORS rejects a lookalike or wildcard origin', () => {
  for (const origin of ['https://game.invalid.evil.invalid', 'null', '*']) {
    assert.throws(() => corsHeaders(new Request('https://test.invalid', { headers: { Origin: origin } })), error => error.status === 403);
  }
});
test('server-to-server request does not get permissive CORS', () => {
  const headers = corsHeaders(new Request('https://test.invalid'));
  assert.equal(headers['Access-Control-Allow-Origin'], undefined);
});
test('job secret comparison accepts only matching bytes', async () => {
  assert.equal(await secretsMatch('a'.repeat(32), 'a'.repeat(32)), true);
  assert.equal(await secretsMatch('a'.repeat(32), 'a'.repeat(31) + 'b'), false);
  assert.equal(await secretsMatch('', 'a'.repeat(32)), false);
});
test('gateway verification fails closed before parsing untrusted body', async () => {
  await assert.rejects(verifySignature(new Headers(), new TextEncoder().encode('not JSON'), 'test-only-placeholder'), /Assinatura inválida/);
});
test('provider keys do not replace the required webhook signature', async () => {
  environment.set('MERCOSULPAY_API_KEY', 'test-only-placeholder');
  environment.set('MERCOSULPAY_WEBHOOK_SECRET', 'test-only-placeholder');
  await assert.rejects(verifySignature(new Headers(), new TextEncoder().encode('{}'), requireEnv('MERCOSULPAY_WEBHOOK_SECRET')), /Assinatura inválida/);
});
test('missing server configuration returns a typed error without exposing values', () => {
  environment.delete('MERCOSULPAY_API_KEY');
  environment.set('MERCOSULPAY_WEBHOOK_SECRET', '   ');
  for (const name of ['MERCOSULPAY_API_KEY', 'MERCOSULPAY_WEBHOOK_SECRET']) {
    assert.throws(() => requireEnv(name), error => error instanceof ApiError && error.status === 503 && error.code === 'BACKEND_NOT_CONFIGURED' && !error.message.includes(name));
  }
});
