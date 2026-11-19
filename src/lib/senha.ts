/**
 * Política de senha do sistema. É pura (sem banco), então vale tanto para o servidor de
 * autenticação quanto para os formulários.
 */
export const SENHA_MIN = 10;
export const SENHA_MAX = 128;

// Senhas que aparecem em qualquer lista de vazamentos, mais as que alguém ligado à empresa tentaria primeiro.
const COMUNS = new Set([
  "1234567890",
  "12345678910",
  "123456789012",
  "0123456789",
  "0987654321",
  "qwertyuiop",
  "qwerty1234",
  "qwerty12345",
  "asdfghjkl1",
  "1q2w3e4r5t",
  "q1w2e3r4t5",
  "senha12345",
  "senha123456",
  "senha@12345",
  "mudar12345",
  "mudar@12345",
  "password12",
  "password123",
  "password1234",
  "passw0rd123",
  "admin12345",
  "admin123456",
  "admin@12345",
  "abc1234567",
  "abcd123456",
  "iloveyou12",
  "pina@2026",
  "pina2026",
  "pinas2026",
  "pina123456",
  "pinas123456",
  "pina@123456",
  "barretos123",
  "barretos2026",
  "brasil2026",
  "brasil12345",
]);

/** Pelo menos duas das quatro classes: minúscula, maiúscula, número, símbolo. */
function classes(senha: string) {
  return [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(senha)).length;
}

/**
 * Devolve a mensagem do problema ou `null` se a senha serve. `contexto` (e-mail e nome da pessoa) impede
 * senhas feitas com os próprios dados.
 */
export function validarSenha(senha: unknown, contexto: { email?: string; nome?: string } = {}): string | null {
  if (typeof senha !== "string") return "Informe a senha.";
  if (senha.length < SENHA_MIN) return `A senha precisa de ao menos ${SENHA_MIN} caracteres.`;
  if (senha.length > SENHA_MAX) return `A senha pode ter no máximo ${SENHA_MAX} caracteres.`;

  const minuscula = senha.toLowerCase();
  if (COMUNS.has(minuscula)) return "Essa senha é muito comum. Escolha outra.";
  if (new Set(senha).size < 4) return "A senha é muito repetitiva. Misture mais caracteres.";
  if (classes(senha) < 2) return "Misture letras maiúsculas e minúsculas, números ou símbolos.";

  const parteDoEmail = contexto.email?.split("@")[0]?.toLowerCase();
  if (parteDoEmail && parteDoEmail.length >= 4 && minuscula.includes(parteDoEmail)) {
    return "Não use o seu e-mail dentro da senha.";
  }
  for (const palavra of (contexto.nome ?? "").toLowerCase().split(/\s+/)) {
    if (palavra.length >= 4 && minuscula.includes(palavra)) return "Não use o seu nome dentro da senha.";
  }
  return null;
}
