import { describe, expect, it } from "vitest";
import { canTransitionProperty, canTransitionRequirement, isPropertyOperational, isRequirementOperational } from "./lifecycle";

describe("lifecycle guards", () => {
  it("allows the approved property path", () => {
    expect(canTransitionProperty("DRAFT", "VERIFICATION_PENDING")).toBe(true);
    expect(canTransitionProperty("VERIFICATION_PENDING", "ACTIVE")).toBe(true);
    expect(canTransitionProperty("ACTIVE", "RENTED")).toBe(true);
    expect(canTransitionProperty("RENTED", "ARCHIVED")).toBe(true);
  });
  it("blocks closed property reopening and non-active operations", () => {
    expect(canTransitionProperty("RENTED", "ACTIVE")).toBe(false);
    expect(isPropertyOperational("RENTED")).toBe(false);
    expect(isPropertyOperational("ACTIVE")).toBe(true);
  });
  it("enforces the requirement lifecycle", () => {
    expect(canTransitionRequirement("DRAFT", "ACTIVE")).toBe(true);
    expect(canTransitionRequirement("ACTIVE", "DORMANT")).toBe(true);
    expect(canTransitionRequirement("CLOSED", "ACTIVE")).toBe(false);
    expect(isRequirementOperational("PAUSED")).toBe(false);
  });
});

