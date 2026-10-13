import { ApiError } from "./response.ts";

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",").map((value) => value.trim()).filter(Boolean);
  if (origin && !allowed.includes(origin)) {
    throw new ApiError(403, "ORIGIN_NOT_ALLOWED", "Origem não autorizada.");
  }
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
