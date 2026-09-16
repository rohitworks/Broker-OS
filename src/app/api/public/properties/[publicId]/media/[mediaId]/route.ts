import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createR2Client, getPrivateMediaBucket } from "@/lib/storage/r2";

export async function GET(_: Request, { params }: { params: Promise<{ publicId: string; mediaId: string }> }) {
  const { publicId, mediaId } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: property } = await supabase.from("properties").select("id").eq("public_id", publicId).eq("status", "ACTIVE").single();
  if (!property) return NextResponse.json({ error: "Media unavailable" }, { status: 404 });
  const { data: media } = await supabase.from("property_media").select("object_key,mime_type").eq("id", mediaId).eq("property_id", property.id).eq("status", "APPROVED").single();
  if (!media) return NextResponse.json({ error: "Media unavailable" }, { status: 404 });
  const url = await getSignedUrl(createR2Client(), new GetObjectCommand({ Bucket: getPrivateMediaBucket(), Key: media.object_key, ResponseContentType: media.mime_type, ResponseCacheControl: "private, max-age=300" }), { expiresIn: 300 });
  return NextResponse.redirect(url, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } });
}
