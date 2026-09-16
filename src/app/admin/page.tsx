import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import Link from "next/link";

const areas = [
  ["Properties", "PID records and lifecycle"],
  ["Requirements", "RID records and search status"],
  ["Match Review", "Operator approval boundary"],
  ["Distribution", "Outbound history and delivery"],
  ["Follow-ups", "Due operator actions"],
  ["Failures", "Recoverable automation errors"],
  ["Settings", "White-label deployment values"],
] as const;

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen px-5 py-7 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">Operator workspace</p><h1 className="mt-1 text-2xl font-bold">Secure data foundation</h1></div>
          <form action={signOut}><button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold" type="submit">Sign out</button></form>
        </header>
        <section className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-5"><p className="font-semibold text-green-900">Day 2 foundation active</p><p className="mt-1 text-sm leading-6 text-green-800">Authenticated as {user.email}. PID/RID allocation, lifecycle guards, RLS, audit history, and realistic seed data are installed through versioned migrations.</p></section>
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{areas.map(([title, detail]) => ["Properties", "Requirements"].includes(title) ? <Link href={title === "Properties" ? "/admin/properties" : "/admin/requirements"} key={title} className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm hover:border-green-400"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p><span className="mt-5 inline-block text-xs font-semibold uppercase tracking-wider text-green-700">Open module →</span></Link> : <article key={title} className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p><span className="mt-5 inline-block text-xs font-semibold uppercase tracking-wider text-slate-400">Foundation only</span></article>)}</section>
      </div>
    </main>
  );
}
