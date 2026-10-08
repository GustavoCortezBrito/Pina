/** Retorno padrão das Server Actions (arquivo sem dependências de servidor: pode ser importado no cliente). */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
