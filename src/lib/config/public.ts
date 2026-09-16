import { z } from "zod";

const hexColour = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a six-digit hex colour");
const publicConfigSchema = z.object({
  appName: z.string().trim().min(1),
  brandPrimary: hexColour,
  brandAccent: hexColour,
  baseUrl: z.url(),
  locale: z.string().trim().min(2),
  timezone: z.string().trim().min(1),
  currency: z.string().length(3).transform((value) => value.toUpperCase()),
  supportPhone: z.string().regex(/^\+[1-9]\d{7,14}$/, "must be an E.164 phone number"),
  defaultLocality: z.string().trim().min(1),
});

export type PublicConfig = Omit<z.infer<typeof publicConfigSchema>, "baseUrl"> & { baseUrl: URL };

export function parsePublicConfig(env: Readonly<Record<string, string | undefined>>): PublicConfig {
  const parsed = publicConfigSchema.parse({
    appName: env.NEXT_PUBLIC_APP_NAME ?? "Broker OS",
    brandPrimary: env.NEXT_PUBLIC_BRAND_PRIMARY ?? "#14532d",
    brandAccent: env.NEXT_PUBLIC_BRAND_ACCENT ?? "#f59e0b",
    baseUrl: env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
    locale: env.NEXT_PUBLIC_BUSINESS_LOCALE ?? "en-IN",
    timezone: env.NEXT_PUBLIC_BUSINESS_TIMEZONE ?? "Asia/Kolkata",
    currency: env.NEXT_PUBLIC_BUSINESS_CURRENCY ?? "INR",
    supportPhone: env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+910000000000",
    defaultLocality: env.NEXT_PUBLIC_DEFAULT_LOCALITY ?? "Pilot Market",
  });
  return { ...parsed, baseUrl: new URL(parsed.baseUrl) };
}

export function getPublicConfig() { return parsePublicConfig(process.env); }
