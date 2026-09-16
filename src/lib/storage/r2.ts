import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { getServerConfig } from "@/lib/config/server";

export function createR2Client() {
  const config = getServerConfig();
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.r2AccessKeyId, secretAccessKey: config.r2SecretAccessKey },
  });
}

export function getPrivateMediaBucket() { return getServerConfig().r2BucketName; }
