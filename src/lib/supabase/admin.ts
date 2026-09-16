import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerConfig } from "@/lib/config/server";

export function createSupabaseAdminClient() {
  const config = getServerConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
