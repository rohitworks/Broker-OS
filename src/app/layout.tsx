import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { AuthHashRedirect } from "@/components/auth-hash-redirect";
import { getPublicConfig } from "@/lib/config/public";
import "./globals.css";

export function generateMetadata(): Metadata {
  const config = getPublicConfig();
  return { title: config.appName, description: "Residential brokerage operating system", robots: { index: false, follow: false } };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#14532d" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const config = getPublicConfig();
  const brandStyle = { "--brand-primary": config.brandPrimary, "--brand-accent": config.brandAccent } as CSSProperties;
  return <html lang="en"><body style={brandStyle}><AuthHashRedirect />{children}</body></html>;
}
