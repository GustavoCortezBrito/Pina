import "server-only";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-types";
import { AppError, isUniqueViolation } from "@/lib/errors";

export type { ActionResult };

/**
 * Executa uma Server Action padronizando o retorno:
 * erros de validação viram `fieldErrors`, AppError vira mensagem amigável
 * e qualquer outro erro é registrado no log e exibido de forma genérica.
 */
export async function runAction<T>(
  fn: () => Promise<T>,
  options: { message?: string; revalidate?: boolean } = {},
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    if (options.revalidate !== false) revalidatePath("/", "layout");
    return { ok: true, data, message: options.message };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of error.issues) {
        const key = issue.path.join(".") || "_";
        (fieldErrors[key] ??= []).push(issue.message);
      }
      return { ok: false, error: "Confira os campos destacados.", fieldErrors };
    }
    if (error instanceof AppError) return { ok: false, error: error.message };
    if (isUniqueViolation(error)) {
      return { ok: false, error: "Já existe um registro com esses dados (valor duplicado)." };
    }
    console.error("[action]", error);
    return { ok: false, error: "Não foi possível concluir a operação. Tente novamente." };
  }
}
