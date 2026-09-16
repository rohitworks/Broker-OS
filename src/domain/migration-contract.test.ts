import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/202609160001_core_foundation.sql"), "utf8");
const activationMigration = readFileSync(resolve(process.cwd(), "supabase/migrations/202609160002_property_activation.sql"), "utf8");

describe("Day 2 migration contract", () => {
  it("contains every Core MVP entity and tenant boundary", () => {
    for (const table of ["businesses", "users", "contacts", "properties", "property_media", "requirements", "matches", "shortlists", "leads", "property_pages", "distribution_events", "communications", "consents", "tasks", "audit_events", "automation_failures"]) {
      expect(migration).toContain(`create table public.${table}`);
    }
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("current_business_id()");
    expect(migration.match(/same_business_fk/g)?.length).toBeGreaterThanOrEqual(25);
  });

  it("enforces property activation in the database", () => {
    expect(activationMigration).toContain("validate_property_activation()");
    expect(activationMigration).toContain("at least one approved media item is required");
    expect(activationMigration).toContain("verify_and_activate_property");
  });

  it("installs immutable references, lifecycle guards, and audit triggers", () => {
    expect(migration).toContain("allocate_public_reference()");
    expect(migration).toContain("prevent_public_reference_change()");
    expect(migration).toContain("enforce_property_status_transition()");
    expect(migration).toContain("enforce_requirement_status_transition()");
    expect(migration).toContain("record_audit_event()");
  });

  it("makes idempotency keys unique", () => {
    expect(migration.match(/unique \(business_id, idempotency_key\)/g)).toHaveLength(2);
  });
});
