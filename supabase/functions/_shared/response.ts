export class ApiError extends Error {
  public status: number;
  public code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

export function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export function errorResponse(error: unknown, headers: HeadersInit = {}) {
  if (error instanceof ApiError) {
    return jsonResponse({ ok: false, error: { code: error.code, message: error.message } }, error.status, headers);
  }
  // Never log Authorization, payment bodies, passwords, CPF or provider keys.
  console.error("LifeBots: unhandled server error", error instanceof Error ? error.name : "unknown");
  return jsonResponse({ ok: false, error: { code: "INTERNAL_ERROR", message: "Não foi possível concluir esta operação." } }, 500, headers);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new ApiError(415, "JSON_REQUIRED", "Envie um corpo JSON.");
  }
  const body = await readRawBody(request);
  let value: unknown;
  try { value = JSON.parse(new TextDecoder().decode(body)); }
  catch { throw new ApiError(400, "INVALID_JSON", "JSON inválido."); }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "INVALID_BODY", "Corpo inválido.");
  }
  return value as Record<string, unknown>;
}

export async function readRawBody(request: Request, limit = 65_536): Promise<Uint8Array> {
  const declared = Number(request.headers.get("content-length"));
  if (declared > limit) throw new ApiError(413, "BODY_TOO_LARGE", "Corpo muito grande.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new ApiError(413, "BODY_TOO_LARGE", "Corpo muito grande.");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}

export function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new ApiError(503, "BACKEND_NOT_CONFIGURED", "Serviço temporariamente indisponível.");
  return value;
}

// Fixed-size digest comparison avoids differences caused by secret length.
export async function secretsMatch(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [aHash, bHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const av = new Uint8Array(aHash), bv = new Uint8Array(bHash);
  let difference = 0;
  for (let i = 0; i < av.length; i++) difference |= av[i] ^ bv[i];
  return difference === 0;
}
