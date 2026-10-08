/** Erro de regra de negócio: a mensagem é exibida ao usuário. */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function isUniqueViolation(error: unknown): error is { code: string; meta?: unknown } {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}
