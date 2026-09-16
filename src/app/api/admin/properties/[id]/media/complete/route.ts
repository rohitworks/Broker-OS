import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { mediaUploadSchema } from "@/domain/property";
import { requireOperator } from "@/lib/auth/operator";
import { createR2Client, getPrivateMediaBucket } from "@/lib/storage/r2";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = mediaUploadSchema.safeParse(body);
  if (!parsed.success || parsed.data.propertyId !== id || typeof body.objectKey !== "string") return NextResponse.json({ error: "Invalid media metadata" }, { status: 400 });
  const { supabase, operator } = await requireOperator();
  const requiredPrefix = `${operator.business_id}/properties/${id}/`;
  if (!body.objectKey.startsWith(requiredPrefix)) return NextResponse.json({ error: "Invalid object key" }, { status: 403 });
  const object = await createR2Client().send(new HeadObjectCommand({ Bucket: getPrivateMediaBucket(), Key: body.objectKey }));
  if (object.ContentLength !== parsed.data.byteSize || object.ContentType !== parsed.data.mimeType) return NextResponse.json({ error: "Uploaded object metadata does not match" }, { status: 409 });
  const { data: previous } = await supabase.from("property_media").select("sort_order").eq("property_id", id).eq("business_id", operator.business_id).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { data: media, error } = await supabase.from("property_media").insert({ business_id: operator.business_id, property_id: id, object_key: body.objectKey, mime_type: parsed.data.mimeType, byte_size: parsed.data.byteSize, sort_order: (previous?.sort_order ?? -1) + 1, status: "PENDING" }).select("id,status,sort_order").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ media }, { status: 201 });
}

