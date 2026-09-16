import { NextResponse } from "next/server";
import { getPublicConfig } from "@/lib/config/public";

export const dynamic = "force-dynamic";

export function GET() {
  const config = getPublicConfig();
  return NextResponse.json({ status: "ok", service: config.appName, timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
