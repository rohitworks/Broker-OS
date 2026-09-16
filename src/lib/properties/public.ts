import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PUBLIC_PROPERTY_STATUSES, toPublicProperty, type PublicPropertyRecord } from "@/domain/public-property";

export async function getPublicProperty(publicId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("properties").select("id,public_id,status,transaction_type,locality,society,property_type,bhk,area_sqft,price_amount,available_from,furnishing,parking,amenities,updated_at,property_pages!inner(inquiries_enabled),property_media(id,mime_type,sort_order,status)").eq("public_id", publicId).in("status", [...PUBLIC_PROPERTY_STATUSES]).single();
  if (error || !data) return null;
  return toPublicProperty(data as unknown as PublicPropertyRecord);
}

