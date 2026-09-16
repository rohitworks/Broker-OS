import { z } from "zod";
export const requirementSchema = z.object({
  name: z.string().trim().min(2), phone: z.string().regex(/^\+[1-9]\d{7,14}$/), email: z.union([z.literal(""), z.email()]),
  transactionType: z.enum(["RENT", "RESALE"]), localities: z.string().transform(v => v.split(",").map(x => x.trim()).filter(Boolean)),
  propertyTypes: z.string().transform(v => v.split(",").map(x => x.trim()).filter(Boolean)), bhkMin: z.coerce.number().positive(), bhkMax: z.coerce.number().positive(), budgetMin: z.coerce.number().min(0), budgetMax: z.coerce.number().positive(), timeline: z.union([z.literal(""), z.iso.date()]), parking: z.boolean().default(false), consent: z.literal(true), source: z.string().trim().min(1).max(80),
}).refine(v => v.bhkMax >= v.bhkMin && v.budgetMax >= v.budgetMin && v.localities.length > 0 && v.propertyTypes.length > 0, "Requirement ranges or preferences are invalid");
export type RequirementInput = z.input<typeof requirementSchema>; export type Requirement = z.output<typeof requirementSchema>;
