import { processMercosulWebhook, verifyMercosulWebhook } from "../_shared/mercosulpay.ts";
import { ApiError, errorResponse, jsonResponse, readRawBody } from "../_shared/response.ts";

Deno.serve(async (request: Request) => {
  try {
    if (request.method !== "POST") throw new ApiError(405, "METHOD_NOT_ALLOWED", "Use POST.");
    const rawBody = await readRawBody(request);
    // Authentication precedes parsing and every write. Bank validation is a
    // separate operational step; the adapter verifies the configured HMAC.
    const verified = await verifyMercosulWebhook(request.headers, rawBody);
    let payload: unknown;
    try { payload = JSON.parse(new TextDecoder().decode(rawBody)); }
    catch { throw new ApiError(400, "INVALID_JSON", "JSON inválido."); }
    await processMercosulWebhook(verified, payload);
    return jsonResponse({ ok: true });
  } catch (error) { return errorResponse(error); }
});
