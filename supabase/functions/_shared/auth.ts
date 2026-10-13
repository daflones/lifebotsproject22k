import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { ApiError, requireEnv } from "./response.ts";

export function serverClient() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireUser(request: Request) {
  const authorization = request.headers.get("Authorization") ?? "";
  const token = /^Bearer\s+([^\s]+)$/i.exec(authorization)?.[1];
  if (!token) throw new ApiError(401, "AUTH_REQUIRED", "Entre na sua conta para continuar.");
  const client = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Verify with Auth, never trust a JWT obtained through decode alone.
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new ApiError(401, "INVALID_SESSION", "Sua sessão expirou. Entre novamente.");
  return data.user;
}

export async function requireAdmin(userId: string) {
  const { data, error } = await serverClient().from("lr_admin_roles").select("role").eq("user_id", userId).maybeSingle();
  if (error) throw new ApiError(503, "BACKEND_NOT_READY", "Serviço temporariamente indisponível.");
  if (data?.role !== "admin") throw new ApiError(403, "ADMIN_REQUIRED", "Acesso restrito ao administrador.");
}
