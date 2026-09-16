export const PROPERTY_STATUSES = ["DRAFT", "VERIFICATION_PENDING", "ACTIVE", "PAUSED", "STALE", "RENTED", "SOLD", "WITHDRAWN", "ARCHIVED"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const REQUIREMENT_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "DORMANT", "CLOSED", "EXPIRED"] as const;
export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];

const propertyTransitions: Record<PropertyStatus, readonly PropertyStatus[]> = {
  DRAFT: ["VERIFICATION_PENDING"],
  VERIFICATION_PENDING: ["DRAFT", "ACTIVE", "WITHDRAWN"],
  ACTIVE: ["PAUSED", "STALE", "RENTED", "SOLD", "WITHDRAWN"],
  PAUSED: ["ACTIVE", "STALE", "WITHDRAWN"],
  STALE: ["ACTIVE", "PAUSED", "WITHDRAWN"],
  RENTED: ["ARCHIVED"],
  SOLD: ["ARCHIVED"],
  WITHDRAWN: ["ARCHIVED"],
  ARCHIVED: [],
};

const requirementTransitions: Record<RequirementStatus, readonly RequirementStatus[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["PAUSED", "DORMANT", "CLOSED", "EXPIRED"],
  PAUSED: ["ACTIVE", "CLOSED", "EXPIRED"],
  DORMANT: ["ACTIVE", "CLOSED", "EXPIRED"],
  CLOSED: [],
  EXPIRED: [],
};

export function canTransitionProperty(from: PropertyStatus, to: PropertyStatus) { return from === to || propertyTransitions[from].includes(to); }
export function canTransitionRequirement(from: RequirementStatus, to: RequirementStatus) { return from === to || requirementTransitions[from].includes(to); }
export function isPropertyOperational(status: PropertyStatus) { return status === "ACTIVE"; }
export function isRequirementOperational(status: RequirementStatus) { return status === "ACTIVE"; }

