"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Verifying your secure link…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("access_token") || window.sessionStorage.getItem("broker_os_recovery_token");
    const type = hash.get("type");
    if (!token || (hash.size > 0 && type !== "recovery" && type !== "invite")) {
      setMessage("This recovery link is invalid or has expired. Request a new one from your administrator.");
      return;
    }
    window.sessionStorage.setItem("broker_os_recovery_token", token);
    setAccessToken(token);
    setReady(true);
    setMessage("");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 12) return setMessage("Use a password of at least 12 characters.");
    if (password !== confirmPassword) return setMessage("The passwords do not match.");
    setMessage("Saving your new password…");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || !accessToken) return setMessage("This recovery session is unavailable. Request a new link.");
    const response = await fetch(`${url}/auth/v1/user`, { method: "PUT", headers: { apikey: key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null;
      return setMessage(body?.message || "Could not update the password. Request a new link and try again.");
    }
    window.sessionStorage.removeItem("broker_os_recovery_token");
    window.location.assign("/login?reset=success");
  }

  return <main className="grid min-h-screen place-items-center px-5 py-10"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-[0_18px_70px_rgba(31,50,38,0.12)] sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-primary)]">Secure operator access</p><h1 className="mt-3 text-3xl font-bold tracking-tight">Set your password</h1><p className="mt-2 text-sm leading-6 text-slate-600">Choose a new password for your Broker OS operator account.</p>{message ? <p role="alert" className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p> : null}{ready ? <form onSubmit={submit} className="mt-7 grid gap-5"><label className="grid gap-2 text-sm font-semibold">New password<input required autoComplete="new-password" minLength={12} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-green-100" /></label><label className="grid gap-2 text-sm font-semibold">Confirm password<input required autoComplete="new-password" minLength={12} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-green-100" /></label><button className="rounded-xl bg-[var(--brand-primary)] px-4 py-3 font-semibold text-white hover:opacity-95" type="submit">Save password</button></form> : null}<Link className="mt-6 inline-block text-sm font-semibold text-[var(--brand-primary)]" href="/login">Return to sign in</Link></section></main>;
}
