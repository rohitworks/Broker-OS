import { z } from "zod";

export const PUBLIC_PROPERTY_STATUSES = ["ACTIVE", "PAUSED", "STALE", "RENTED", "SOLD", "WITHDRAWN", "ARCHIVED"] as const;
export type PublicPropertyStatus = (typeof PUBLIC_PROPERTY_STATUSES)[number];

export type PublicPropertyRecord = {
  id: string;
  public_id: string;
  status: PublicPropertyStatus;
  transaction_type: "RENT" | "RESALE";
  locality: string;
  society: string | null;
  property_type: string;
  bhk: number | string | null;
  area_sqft: number | null;
  price_amount: number | string | null;
  available_from: string | null;
  furnishing: string | null;
  parking: boolean | null;
  amenities: string[] | null;
  updated_at: string;
  property_pages: { inquiries_enabled: boolean } | { inquiries_enabled: boolean }[];
  property_media: Array<{ id: string; mime_type: string; sort_order: number; status: string }>;
};

export function toPublicProperty(record: PublicPropertyRecord) {
  const page = Array.isArray(record.property_pages) ? record.property_pages[0] : record.property_pages;
  return {
    id: record.id,
    publicId: record.public_id,
    status: record.status,
    transactionType: record.transaction_type,
    locality: record.locality,
    society: record.society,
    propertyType: record.property_type,
    bhk: record.bhk === null ? null : Number(record.bhk),
    areaSqft: record.area_sqft,
    priceAmount: record.price_amount === null ? null : Number(record.price_amount),
    availableFrom: record.available_from,
    furnishing: record.furnishing,
    parking: record.parking,
    amenities: record.amenities ?? [],
    updatedAt: record.updated_at,
    inquiriesEnabled: record.status === "ACTIVE" && Boolean(page?.inquiries_enabled),
    media: record.status === "ACTIVE" ? record.property_media.filter((item) => item.status === "APPROVED").sort((a, b) => a.sort_order - b.sort_order).map(({ id, mime_type }) => ({ id, mimeType: mime_type })) : [],
  };
}

export type PublicProperty = ReturnType<typeof toPublicProperty>;

export const publicInquirySchema = z.object({
  publicId: z.string().regex(/^PID-[A-Z0-9]{2,8}-[RS]-\d{5}$/),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, "Use an E.164 phone number"),
  email: z.union([z.literal(""), z.email()]),
  intent: z.enum(["INTERESTED", "QUESTION", "CREATE_REQUIREMENT"]),
  message: z.string().trim().max(1000),
  consent: z.literal("on", { error: "Consent is required" }),
  idempotencyKey: z.uuid(),
  website: z.string().max(0),
});

