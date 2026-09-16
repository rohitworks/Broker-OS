import Link from "next/link";
import { requireOperator } from "@/lib/auth/operator";

export default async function PropertiesPage() {
  const { supabase, operator } = await requireOperator();
  const { data: properties, error } = await supabase.from("properties").select("id,public_id,status,transaction_type,locality,society,property_type,bhk,price_amount,updated_at").eq("business_id", operator.business_id).order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return <main className="min-h-screen px-5 py-7 sm:px-10"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-end justify-between gap-4"><div><Link className="text-sm font-semibold text-[var(--brand-primary)]" href="/admin">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Properties</h1><p className="mt-2 text-slate-600">Draft, verify, approve media, and activate inventory.</p></div><Link className="rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white" href="/admin/properties/new">Add property</Link></header><section className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm">{properties?.length ? <div className="divide-y divide-slate-100">{properties.map((property) => <Link key={property.id} href={`/admin/properties/${property.id}`} className="grid gap-2 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[1.1fr_1fr_.7fr_.5fr] sm:items-center"><div><p className="font-semibold">{property.public_id}</p><p className="text-sm text-slate-500">{property.society || property.property_type}</p></div><p className="text-sm">{property.locality} · {property.bhk} BHK</p><p className="text-sm font-semibold">₹{Number(property.price_amount).toLocaleString("en-IN")}</p><Status value={property.status} /></Link>)}</div> : <div className="p-10 text-center"><p className="font-semibold">No properties yet</p><p className="mt-2 text-sm text-slate-500">Create the first draft to begin the PID workflow.</p></div>}</section></div></main>;
}

function Status({ value }: { value: string }) { return <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{value.replaceAll("_", " ")}</span>; }

