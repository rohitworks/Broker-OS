"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOperator } from "@/lib/auth/operator";
import { propertyIntakeSchema } from "@/domain/property";

export type PropertyActionResult = { error?: string };

export async function createProperty(input: unknown): Promise<PropertyActionResult> {
  const parsed = propertyIntakeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid property details" };
  const { supabase, operator } = await requireOperator();
  const values = parsed.data;

  const { data: contact, error: contactError } = await supabase.from("contacts").upsert({
    business_id: operator.business_id,
    kind: values.transactionType === "RENT" ? "OWNER" : "SELLER",
    full_name: values.ownerName,
    phone_e164: values.ownerPhone,
    email: values.ownerEmail,
  }, { onConflict: "business_id,phone_e164" }).select("id").single();
  if (contactError || !contact) return { error: contactError?.message ?? "Could not save owner" };

  const { data: property, error } = await supabase.from("properties").insert({
    business_id: operator.business_id,
    owner_contact_id: contact.id,
    transaction_type: values.transactionType,
    status: "DRAFT",
    locality: values.locality,
    society: values.society,
    property_type: values.propertyType,
    bhk: values.bhk,
    area_sqft: values.areaSqft,
    price_amount: values.priceAmount,
    available_from: values.availableFrom,
    furnishing: values.furnishing,
    parking: values.parking,
    amenities: values.amenities,
    consent_confirmed_at: new Date().toISOString(),
    internal_notes: values.internalNotes,
    created_by: operator.id,
  }).select("id").single();
  if (error || !property) return { error: error?.message ?? "Could not create property" };
  revalidatePath("/admin/properties");
  redirect(`/admin/properties/${property.id}`);
}

export async function approveMedia(formData: FormData) {
  const mediaId = String(formData.get("mediaId") ?? "");
  const propertyId = String(formData.get("propertyId") ?? "");
  const { supabase, operator } = await requireOperator();
  const { error } = await supabase.from("property_media").update({ status: "APPROVED" }).eq("id", mediaId).eq("property_id", propertyId).eq("business_id", operator.business_id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function activateProperty(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "");
  const { supabase } = await requireOperator();
  const { error } = await supabase.rpc("verify_and_activate_property", { property_uuid: propertyId });
  if (error) redirect(`/admin/properties/${propertyId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin/properties");
  redirect(`/admin/properties/${propertyId}?activated=1`);
}

