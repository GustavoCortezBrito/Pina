/**
 * Política de segurança de conteúdo (CSP). Cada pedido recebe um código novo (`nonce`): só os scripts
 * que o próprio servidor entrega com esse código executam. Assim, mesmo que alguém consiga injetar um
 * trecho de HTML/JavaScript numa página, o navegador se recusa a rodá-lo.
 */
export function montarCsp({
  nonce,
  desenvolvimento = false,
  https = false,
}: {
  nonce: string;
  desenvolvimento?: boolean;
  /** Só com HTTPS: manda o navegador trocar qualquer endereço http:// por https://. */
  https?: boolean;
}) {
  const diretivas = [
    "default-src 'self'",
    // 'strict-dynamic': os scripts que o Next entrega (com o código) podem carregar os seus próprios pedaços.
    // 'unsafe-eval' só no desenvolvimento (o React usa para mostrar erros melhores).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${desenvolvimento ? " 'unsafe-eval'" : ""}`,
    // Estilos em linha são necessários (Tailwind/animações aplicam style no elemento); o risco é bem menor que o de scripts.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // viacep.com.br: preenchimento do endereço pelo CEP.
    `connect-src 'self' https://viacep.com.br${desenvolvimento ? " ws: wss:" : ""}`,
    // O PDF do contrato assinado aparece num iframe do próprio sistema.
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];
  if (https) diretivas.push("upgrade-insecure-requests");
  return diretivas.join("; ");
}

/** Código aleatório de uso único para o `nonce` (128 bits). */
export function novoNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}
