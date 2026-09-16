"use server";

import { redirect } from "next/navigation";
import { publicInquirySchema } from "@/domain/public-property";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function submitPublicInquiry(formData: FormData) {
  const parsed = publicInquirySchema.safeParse({
    publicId: formData.get("publicId"), fullName: formData.get("fullName"), phone: formData.get("phone"), email: formData.get("email"), intent: formData.get("intent"), message: formData.get("message"), consent: formData.get("consent"), idempotencyKey: formData.get("idempotencyKey"), website: formData.get("website") ?? "",
  });
  const publicId = String(formData.get("publicId") ?? "");
  if (!parsed.success) redirect(`/p/${encodeURIComponent(publicId)}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid details")}`);
  const values = parsed.data;
  const { error } = await createSupabaseAdminClient().rpc("create_public_property_inquiry", {
    p_public_id: values.publicId, p_full_name: values.fullName, p_phone_e164: values.phone, p_email: values.email, p_action: values.intent, p_message: values.message, p_consent: true, p_idempotency_key: values.idempotencyKey,
  });
  if (error) redirect(`/p/${encodeURIComponent(values.publicId)}?error=${encodeURIComponent(error.message)}`);
  redirect(`/p/${encodeURIComponent(values.publicId)}?received=1`);
}

