import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireOperator() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: operator, error } = await supabase.from("users").select("id,business_id,role,display_name").eq("auth_user_id", user.id).eq("active", true).single();
  if (error || !operator) throw new Error("Authenticated account is not linked to an active operator");
  return { supabase, user, operator };
}

