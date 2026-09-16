export type ReferenceKind = "PID" | "RID";
export type ReferenceTransaction = "RENT" | "RESALE";

export function formatPublicReference(kind: ReferenceKind, businessCode: string, transaction: ReferenceTransaction, sequence: number) {
  if (!/^[A-Z0-9]{2,8}$/.test(businessCode)) throw new Error("Invalid business code");
  if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence > 99999) throw new Error("Invalid sequence");
  const role = kind === "PID" ? (transaction === "RENT" ? "R" : "S") : (transaction === "RENT" ? "T" : "B");
  return `${kind}-${businessCode}-${role}-${String(sequence).padStart(5, "0")}`;
}

