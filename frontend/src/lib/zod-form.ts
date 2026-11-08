import { z } from "zod";

export type FieldErrors = Record<string, string>;

export function getZodErrors(schema: z.ZodTypeAny, values: unknown): FieldErrors {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "general");
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function getZodFieldError(schema: z.ZodTypeAny, values: unknown, field: string): string | undefined {
  return getZodErrors(schema, values)[field];
}

export function focusFirstInvalidField(errors: FieldErrors): void {
  if (typeof document === "undefined") return;
  const first = Object.keys(errors)[0];
  if (!first || first === "general") return;
  const element = document.getElementById(first);
  element?.focus();
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
}
