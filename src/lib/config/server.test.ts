import { describe, expect, it } from "vitest";
import { parseServerConfig } from "./server-schema";

const valid = { NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service", R2_ACCOUNT_ID: "account", R2_ACCESS_KEY_ID: "access", R2_SECRET_ACCESS_KEY: "secret", R2_BUCKET_NAME: "private-media" };

describe("server-only infrastructure configuration", () => {
  it("parses complete Supabase and R2 settings", () => { expect(parseServerConfig(valid)).toMatchObject({ r2BucketName: "private-media", supabaseAnonKey: "anon" }); });
  it("fails fast when a secret is absent", () => { const env = { ...valid, R2_SECRET_ACCESS_KEY: undefined }; expect(() => parseServerConfig(env)).toThrow(); });
});
