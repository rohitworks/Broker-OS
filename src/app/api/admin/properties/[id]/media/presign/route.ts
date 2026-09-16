import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { mediaUploadSchema, sanitiseMediaFileName } from "@/domain/property";
import { requireOperator } from "@/lib/auth/operator";
import { createR2Client, getPrivateMediaBucket } from "@/lib/storage/r2";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = mediaUploadSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.propertyId !== id) return NextResponse.json({ error: "Invalid media metadata" }, { status: 400 });
  const { supabase, operator } = await requireOperator();
  const { data: property } = await supabase.from("properties").select("id").eq("id", id).eq("business_id", operator.business_id).single();
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  const objectKey = `${operator.business_id}/properties/${id}/${randomUUID()}-${sanitiseMediaFileName(parsed.data.fileName)}`;
  const command = new PutObjectCommand({ Bucket: getPrivateMediaBucket(), Key: objectKey, ContentType: parsed.data.mimeType, ContentLength: parsed.data.byteSize });
  const uploadUrl = await getSignedUrl(createR2Client(), command, { expiresIn: 300 });
  return NextResponse.json({ uploadUrl, objectKey, expiresIn: 300 }, { headers: { "Cache-Control": "no-store" } });
}

