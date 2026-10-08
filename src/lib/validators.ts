export function onlyDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/** CPF → só dígitos; CNPJ → dígitos e letras maiúsculas (CNPJ alfanumérico, IN RFB 2.229/2024). */
export function normalizeDocumento(value: string | null | undefined): string {
  return (value ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (len: number) => {
    let total = 0;
    for (let i = 0; i < len; i++) total += Number(cpf[i]) * (len + 1 - i);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

/** Aceita o CNPJ numérico e o alfanumérico (letras nas 12 primeiras posições). */
export function isValidCNPJ(value: string): boolean {
  const cnpj = normalizeDocumento(value);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;
  // Cada caractere vale (código ASCII − 48): dígitos mantêm o valor, "A" vale 17.
  const values = [...cnpj].map((char) => char.charCodeAt(0) - 48);
  const digit = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const total = weights.reduce((acc, w, i) => acc + values[i] * w, 0);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return digit(12) === values[12] && digit(13) === values[13];
}
