import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirect";

describe("post-auth redirects", () => {
  it("allows local application paths", () => { expect(safeNextPath("/admin/properties")).toBe("/admin/properties"); });
  it("blocks external and ambiguous destinations", () => {
    expect(safeNextPath("https://attacker.test")).toBe("/admin");
    expect(safeNextPath("//attacker.test")).toBe("/admin");
    expect(safeNextPath("/\\attacker.test")).toBe("/admin");
  });
});

