import { getPublicConfig } from "@/lib/config/public";
import Link from "next/link";

const foundation = [
  ["Application", "Next.js App Router and TypeScript"],
  ["Data and auth", "RLS schema and operator access configured"],
  ["Property intake", "Draft, PID, verification, and activation"],
  ["Private media", "Signed R2 upload and approval workflow"],
] as const;

export default function Home() {
  const config = getPublicConfig();
  return (
    <main className="min-h-screen px-5 py-8 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_18px_70px_rgba(31,50,38,0.10)]">
        <header className="flex items-center justify-between border-b border-black/8 px-6 py-5 sm:px-9">
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-primary)]">Technical Core MVP</p><h1 className="mt-1 text-xl font-semibold">{config.appName}</h1></div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">Day 4</span>
        </header>
        <div className="grid gap-10 px-6 py-12 sm:px-9 lg:grid-cols-[1.25fr_1fr] lg:px-12 lg:py-16">
          <div><p className="text-sm font-semibold text-[var(--brand-primary)]">Secure data foundation ready</p><h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">One dependable operating loop, built from the core outward.</h2><p className="mt-5 max-w-xl text-base leading-7 text-slate-600">The application now has an authenticated operator boundary, permanent PID/RID allocation, enforced lifecycles, tenant-scoped data access, and durable audit history.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/login" className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white">Operator sign in</Link><span className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">{config.currency} · {config.timezone}</span></div></div>
          <div className="grid gap-3">{foundation.map(([title, detail]) => <article key={title} className="rounded-2xl border border-black/8 bg-slate-50 p-5"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p></article>)}</div>
        </div>
        <footer className="border-t border-black/8 px-6 py-4 text-xs text-slate-500 sm:px-9">Private pilot foundation · {config.baseUrl.host}</footer>
      </section>
    </main>
  );
}
