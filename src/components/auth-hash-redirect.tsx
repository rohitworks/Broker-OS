"use client";

import { useEffect } from "react";

/**
 * Supabase email links use an implicit-flow hash. Route recovery and invite
 * links to the page that lets the operator choose their password, without
 * putting the token into a server-visible query string.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const type = params.get("type");
    if ((type === "recovery" || type === "invite") && window.location.pathname !== "/reset-password") {
      window.location.replace(`/reset-password${hash}`);
    }
  }, []);

  return null;
}
