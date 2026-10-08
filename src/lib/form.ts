import { z } from "zod";

/** Campo de texto opcional: chega "" do formulário e vira null no banco. */
export const texto = (max: number) => z.string().trim().max(max);

export function nullIfEmpty(value: string | null | undefined): string | null {
  const limpo = value?.trim();
  return limpo ? limpo : null;
}

export const dataISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.");

export const dataISOOpcional = z.union([z.literal(""), dataISO]);

export const mesISO = z.string().regex(/^\d{4}-\d{2}$/, "Informe um mês válido.");
