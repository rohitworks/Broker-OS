"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { propertyIntakeSchema, type PropertyIntake, type PropertyIntakeInput } from "@/domain/property";
import { createProperty } from "../actions";

const inputClass = "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-green-100";

export function PropertyForm() {
  const [serverError, setServerError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyIntakeInput, unknown, PropertyIntake>({ resolver: zodResolver(propertyIntakeSchema), defaultValues: { transactionType: "RENT", parking: false, consent: true, amenities: "" } });

  const submit = handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createProperty(values);
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-7">
      {serverError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{serverError}</p> : null}
      <Fieldset title="Owner and consent">
        <Field label="Owner name" error={errors.ownerName?.message}><input className={inputClass} {...register("ownerName")} /></Field>
        <Field label="Phone (E.164)" error={errors.ownerPhone?.message}><input className={inputClass} placeholder="+919876500000" {...register("ownerPhone")} /></Field>
        <Field label="Email" error={errors.ownerEmail?.message}><input className={inputClass} type="email" {...register("ownerEmail")} /></Field>
        <label className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-sm"><input type="checkbox" className="mt-1" {...register("consent")} /><span><strong>Owner consent confirmed</strong><br />The owner permits operational storage and communication for this property.</span></label>
      </Fieldset>
      <Fieldset title="Property details">
        <Field label="Transaction" error={errors.transactionType?.message}><select className={inputClass} {...register("transactionType")}><option value="RENT">Rent</option><option value="RESALE">Resale</option></select></Field>
        <Field label="Locality" error={errors.locality?.message}><input className={inputClass} {...register("locality")} /></Field>
        <Field label="Society" error={errors.society?.message}><input className={inputClass} {...register("society")} /></Field>
        <Field label="Property type" error={errors.propertyType?.message}><input className={inputClass} placeholder="Apartment" {...register("propertyType")} /></Field>
        <Field label="BHK" error={errors.bhk?.message}><input className={inputClass} type="number" step="0.5" {...register("bhk")} /></Field>
        <Field label="Area (sq ft)" error={errors.areaSqft?.message}><input className={inputClass} type="number" {...register("areaSqft")} /></Field>
        <Field label="Rent / price" error={errors.priceAmount?.message}><input className={inputClass} type="number" {...register("priceAmount")} /></Field>
        <Field label="Available from" error={errors.availableFrom?.message}><input className={inputClass} type="date" {...register("availableFrom")} /></Field>
        <Field label="Furnishing" error={errors.furnishing?.message}><select className={inputClass} {...register("furnishing")}><option value="">Not specified</option><option value="UNFURNISHED">Unfurnished</option><option value="SEMI_FURNISHED">Semi-furnished</option><option value="FULLY_FURNISHED">Fully furnished</option></select></Field>
        <label className="flex items-center gap-3 pt-7 text-sm font-semibold"><input type="checkbox" {...register("parking")} /> Parking available</label>
        <Field label="Amenities (comma-separated)" error={errors.amenities?.message}><input className={inputClass} placeholder="Gym, security, power backup" {...register("amenities")} /></Field>
        <Field label="Internal notes" error={errors.internalNotes?.message}><textarea className={`${inputClass} min-h-24`} {...register("internalNotes")} /></Field>
      </Fieldset>
      <button disabled={pending} className="rounded-xl bg-[var(--brand-primary)] px-5 py-3 font-semibold text-white disabled:opacity-60" type="submit">{pending ? "Creating…" : "Create draft and assign PID"}</button>
    </form>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) { return <fieldset className="grid gap-4 rounded-2xl border border-slate-200 p-5 sm:grid-cols-2"><legend className="px-2 text-lg font-bold">{title}</legend>{children}</fieldset>; }
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="grid content-start gap-2 text-sm font-semibold">{label}{children}{error ? <span className="font-normal text-red-700">{error}</span> : null}</label>; }
