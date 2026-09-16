import { describe, expect, it } from "vitest";
import { publicInquirySchema, toPublicProperty, type PublicPropertyRecord } from "./public-property";

const record = { id: crypto.randomUUID(), public_id: "PID-WH-R-00127", status: "ACTIVE", transaction_type: "RENT", locality: "Whitefield", society: "Cedar Heights", property_type: "Apartment", bhk: "2", area_sqft: 1180, price_amount: "42000", available_from: "2026-10-01", furnishing: "SEMI_FURNISHED", parking: true, amenities: ["gym"], updated_at: "2026-09-16T10:00:00Z", property_pages: { inquiries_enabled: true }, property_media: [{ id: crypto.randomUUID(), mime_type: "image/jpeg", sort_order: 0, status: "APPROVED" }, { id: crypto.randomUUID(), mime_type: "image/jpeg", sort_order: 1, status: "REJECTED" }], owner_contact_id: "private", internal_notes: "private" } as PublicPropertyRecord & { owner_contact_id: string; internal_notes: string };

describe("public property privacy", () => {
  it("allowlists public fields and approved media", () => {
    const result = toPublicProperty(record);
    expect(result.media).toHaveLength(1);
    expect(result.inquiriesEnabled).toBe(true);
    expect(JSON.stringify(result)).not.toContain("owner_contact_id");
    expect(JSON.stringify(result)).not.toContain("internal_notes");
    expect(JSON.stringify(result)).not.toContain("object_key");
  });
  it("removes media and inquiries after closure", () => {
    const result = toPublicProperty({ ...record, status: "RENTED", property_pages: { inquiries_enabled: false } });
    expect(result.media).toEqual([]);
    expect(result.inquiriesEnabled).toBe(false);
  });
});

describe("public inquiry validation", () => {
  it("accepts consented, idempotent input", () => { expect(publicInquirySchema.safeParse({ publicId: "PID-WH-R-00127", fullName: "Vikram Mehta", phone: "+919876500102", email: "", intent: "INTERESTED", message: "Please call", consent: "on", idempotencyKey: crypto.randomUUID(), website: "" }).success).toBe(true); });
  it("rejects bots and missing consent", () => {
    const base = { publicId: "PID-WH-R-00127", fullName: "Vikram Mehta", phone: "+919876500102", email: "", intent: "QUESTION", message: "", consent: "on", idempotencyKey: crypto.randomUUID(), website: "" };
    expect(publicInquirySchema.safeParse({ ...base, website: "spam" }).success).toBe(false);
    expect(publicInquirySchema.safeParse({ ...base, consent: "" }).success).toBe(false);
  });
});

