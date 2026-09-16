import { z } from "zod";

const optionalText = z.string().trim().transform((value) => value || null);

export const propertyIntakeSchema = z.object({
  ownerName: z.string().trim().min(2, "Owner name is required").max(120),
  ownerPhone: z.string().regex(/^\+[1-9]\d{7,14}$/, "Use an E.164 phone number"),
  ownerEmail: z.union([z.literal(""), z.email()]).transform((value) => value || null),
  transactionType: z.enum(["RENT", "RESALE"]),
  locality: z.string().trim().min(2).max(120),
  society: optionalText,
  propertyType: z.string().trim().min(2).max(80),
  bhk: z.coerce.number().positive().max(20),
  areaSqft: z.coerce.number().int().positive().max(100000),
  priceAmount: z.coerce.number().positive().max(1_000_000_000),
  availableFrom: z.union([z.literal(""), z.iso.date()]).transform((value) => value || null),
  furnishing: optionalText,
  parking: z.boolean().default(false),
  amenities: z.string().transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean)),
  consent: z.literal(true, { error: "Owner consent is required" }),
  internalNotes: optionalText,
});

export type PropertyIntakeInput = z.input<typeof propertyIntakeSchema>;
export type PropertyIntake = z.output<typeof propertyIntakeSchema>;

export const ACCEPTED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"] as const;
export const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

export const mediaUploadSchema = z.object({
  propertyId: z.uuid(),
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.enum(ACCEPTED_MEDIA_TYPES),
  byteSize: z.number().int().positive().max(MAX_MEDIA_BYTES),
});

export function sanitiseMediaFileName(fileName: string) {
  const cleaned = fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/-\./g, ".").replace(/^-|-$/g, "");
  return cleaned.slice(-120) || "media";
}
