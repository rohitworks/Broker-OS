import Link from "next/link";
import { requireOperator } from "@/lib/auth/operator";
import { PropertyForm } from "./property-form";

export default async function NewPropertyPage() {
  await requireOperator();
  return <main className="min-h-screen px-5 py-7 sm:px-10"><div className="mx-auto max-w-4xl"><Link className="text-sm font-semibold text-[var(--brand-primary)]" href="/admin/properties">← Properties</Link><h1 className="mt-5 text-3xl font-bold">New property</h1><p className="mt-2 text-slate-600">Save a structured draft and allocate its permanent PID. Verification and media approval happen next.</p><section className="mt-7 rounded-3xl bg-white p-6 shadow-sm sm:p-8"><PropertyForm /></section></div></main>;
}

