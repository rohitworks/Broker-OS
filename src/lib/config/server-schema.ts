import { z } from "zod";

const serverConfigSchema = z.object({
  supabaseUrl: z.url(),
  supabaseAnonKey: z.string().min(1),
  supabaseServiceRoleKey: z.string().min(1),
  r2AccountId: z.string().min(1),
  r2AccessKeyId: z.string().min(1),
  r2SecretAccessKey: z.string().min(1),
  r2BucketName: z.string().min(3),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

export function parseServerConfig(env: Readonly<Record<string, string | undefined>>): ServerConfig {
  return serverConfigSchema.parse({
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    r2AccountId: env.R2_ACCOUNT_ID,
    r2AccessKeyId: env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY,
    r2BucketName: env.R2_BUCKET_NAME,
  });
}
