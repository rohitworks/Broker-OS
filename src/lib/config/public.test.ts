import { describe, expect, it } from "vitest";
import { parsePublicConfig } from "./public";

describe("public white-label configuration", () => {
  it("uses replaceable safe development defaults", () => {
    const config = parsePublicConfig({});
    expect(config.appName).toBe("Broker OS");
    expect(config.baseUrl.origin).toBe("http://localhost:3000");
    expect(config.defaultLocality).toBe("Pilot Market");
  });

  it("accepts a deployment-specific brand and market", () => {
    const config = parsePublicConfig({ NEXT_PUBLIC_APP_NAME: "Acme Homes", NEXT_PUBLIC_BRAND_PRIMARY: "#112233", NEXT_PUBLIC_BRAND_ACCENT: "#abcdef", NEXT_PUBLIC_BASE_URL: "https://homes.example", NEXT_PUBLIC_BUSINESS_LOCALE: "en-GB", NEXT_PUBLIC_BUSINESS_TIMEZONE: "Europe/London", NEXT_PUBLIC_BUSINESS_CURRENCY: "gbp", NEXT_PUBLIC_SUPPORT_PHONE: "+442071234567", NEXT_PUBLIC_DEFAULT_LOCALITY: "West London" });
    expect(config).toMatchObject({ appName: "Acme Homes", currency: "GBP", defaultLocality: "West London" });
  });

  it("rejects invalid public URLs and contact numbers", () => {
    expect(() => parsePublicConfig({ NEXT_PUBLIC_BASE_URL: "not-a-url" })).toThrow();
    expect(() => parsePublicConfig({ NEXT_PUBLIC_SUPPORT_PHONE: "12345" })).toThrow();
  });
});
