"use client";

import { useRef, useState } from "react";
import { ACCEPTED_MEDIA_TYPES, MAX_MEDIA_BYTES } from "@/domain/property";

export function MediaUploader({ propertyId }: { propertyId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function upload() {
    const file = input.current?.files?.[0];
    if (!file) return;
    if (!(ACCEPTED_MEDIA_TYPES as readonly string[]).includes(file.type) || file.size > MAX_MEDIA_BYTES) { setStatus("Use JPEG, PNG, WebP, or MP4 up to 25 MB."); return; }
    setBusy(true); setStatus("Preparing private upload…");
    try {
      const metadata = { propertyId, fileName: file.name, mimeType: file.type, byteSize: file.size };
      const presign = await fetch(`/api/admin/properties/${propertyId}/media/presign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(metadata) });
      if (!presign.ok) throw new Error("Could not prepare upload");
      const { uploadUrl, objectKey } = await presign.json();
      const stored = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!stored.ok) throw new Error("Private media upload failed");
      const complete = await fetch(`/api/admin/properties/${propertyId}/media/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...metadata, objectKey }) });
      if (!complete.ok) throw new Error("Could not register uploaded media");
      setStatus("Upload registered. Refreshing…"); window.location.reload();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Upload failed"); setBusy(false); }
  }

  return <div className="rounded-2xl border border-dashed border-slate-300 p-5"><p className="font-semibold">Add private media</p><p className="mt-1 text-sm text-slate-500">JPEG, PNG, WebP, or MP4. Maximum 25 MB.</p><div className="mt-4 flex flex-wrap gap-3"><input ref={input} type="file" accept={ACCEPTED_MEDIA_TYPES.join(",")} className="max-w-full text-sm" /><button type="button" disabled={busy} onClick={upload} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Uploading…" : "Upload"}</button></div>{status ? <p role="status" className="mt-3 text-sm">{status}</p> : null}</div>;
}

