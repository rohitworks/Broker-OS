import { describe, expect, it } from "vitest";
import { MAX_MEDIA_BYTES, mediaUploadSchema, propertyIntakeSchema, sanitiseMediaFileName } from "./property";

const validProperty = { ownerName: "Ananya Rao", ownerPhone: "+919876500101", ownerEmail: "", transactionType: "RENT", locality: "Whitefield", society: "Cedar Heights", propertyType: "Apartment", bhk: "2", areaSqft: "1180", priceAmount: "42000", availableFrom: "2026-10-01", furnishing: "SEMI_FURNISHED", parking: true, amenities: "gym, security", consent: true, internalNotes: "Verified by phone" };

describe("property intake", () => {
  it("normalises a valid property draft", () => {
    const result = propertyIntakeSchema.parse(validProperty);
    expect(result).toMatchObject({ bhk: 2, areaSqft: 1180, amenities: ["gym", "security"], ownerEmail: null });
  });
  it("requires consent and valid pricing", () => {
    expect(propertyIntakeSchema.safeParse({ ...validProperty, consent: false }).success).toBe(false);
    expect(propertyIntakeSchema.safeParse({ ...validProperty, priceAmount: 0 }).success).toBe(false);
  });
});

describe("private property media", () => {
  it("accepts bounded image and video metadata", () => { expect(mediaUploadSchema.safeParse({ propertyId: crypto.randomUUID(), fileName: "Living Room.jpg", mimeType: "image/jpeg", byteSize: 2_000_000 }).success).toBe(true); });
  it("rejects executable and oversized files", () => {
    expect(mediaUploadSchema.safeParse({ propertyId: crypto.randomUUID(), fileName: "x.exe", mimeType: "application/x-msdownload", byteSize: 10 }).success).toBe(false);
    expect(mediaUploadSchema.safeParse({ propertyId: crypto.randomUUID(), fileName: "x.mp4", mimeType: "video/mp4", byteSize: MAX_MEDIA_BYTES + 1 }).success).toBe(false);
  });
  it("sanitises object-key file names", () => { expect(sanitiseMediaFileName("My Living Room (Final).JPG")).toBe("my-living-room-final.jpg"); });
});
