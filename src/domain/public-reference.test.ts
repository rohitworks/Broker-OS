import { describe, expect, it } from "vitest";
import { formatPublicReference } from "./public-reference";

describe("public references", () => {
  it("formats transaction-specific PID and RID values", () => {
    expect(formatPublicReference("PID", "WH", "RENT", 127)).toBe("PID-WH-R-00127");
    expect(formatPublicReference("RID", "WH", "RENT", 482)).toBe("RID-WH-T-00482");
    expect(formatPublicReference("PID", "WH", "RESALE", 1)).toBe("PID-WH-S-00001");
    expect(formatPublicReference("RID", "WH", "RESALE", 9)).toBe("RID-WH-B-00009");
  });
  it("rejects unsafe codes and invalid ranges", () => {
    expect(() => formatPublicReference("PID", "white field", "RENT", 1)).toThrow();
    expect(() => formatPublicReference("PID", "WH", "RENT", 0)).toThrow();
  });
});
