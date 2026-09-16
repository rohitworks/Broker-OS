import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function publicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Public Supabase configuration is missing");
  return { url, key };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = publicSupabaseConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot write cookies; middleware refreshes them. */ }
      },
    },
  });
}

