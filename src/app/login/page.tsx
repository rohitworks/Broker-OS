import { getPublicConfig } from "@/lib/config/public";
import { safeNextPath } from "@/lib/auth/redirect";
import { signIn } from "./actions";

type LoginPageProps = { searchParams: Promise<{ error?: string; next?: string; reset?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const config = getPublicConfig();
  const params = await searchParams;
  const next = safeNextPath(params.next);
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-[0_18px_70px_rgba(31,50,38,0.12)] sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-primary)]">Secure operator access</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Sign in to {config.appName}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use the operator account provisioned through Supabase Auth.</p>
        {params.reset === "success" ? <p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Password updated. Sign in with your new password.</p> : null}
        {params.error ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{params.error === "missing" ? "Enter both email and password." : "Email or password is incorrect."}</p> : null}
        <form action={signIn} className="mt-7 grid gap-5">
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-2 text-sm font-semibold">Email<input required autoComplete="email" inputMode="email" type="email" name="email" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-green-100" /></label>
          <label className="grid gap-2 text-sm font-semibold">Password<input required autoComplete="current-password" type="password" name="password" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-green-100" /></label>
          <button className="rounded-xl bg-[var(--brand-primary)] px-4 py-3 font-semibold text-white hover:opacity-95" type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}
