import { describe, expect, it } from "vitest";
import { montarCsp, novoNonce } from "@/lib/csp";
import { origemInvalida } from "@/lib/origem";
import { paginaValida } from "@/lib/paginacao";
import { criarProtecaoLogin } from "@/lib/protecao-login";
import { SENHA_MAX, SENHA_MIN, validarSenha } from "@/lib/senha";

describe("política de senha", () => {
  it("aceita uma senha forte", () => {
    expect(validarSenha("Cafe-com-Leite-92")).toBeNull();
    expect(validarSenha("Tr0pical-Manga-77")).toBeNull();
  });

  it("recusa senha curta ou longa demais", () => {
    expect(validarSenha("Ab1!xyz")).toMatch(String(SENHA_MIN));
    expect(validarSenha("Ab1!".repeat(40))).toMatch(String(SENHA_MAX));
  });

  it("recusa senhas comuns, inclusive a antiga senha padrão do sistema", () => {
    for (const comum of ["1234567890", "Senha12345", "PASSWORD123", "pina@2026", "Admin12345"]) {
      expect(validarSenha(comum)).not.toBeNull();
    }
  });

  it("recusa senha repetitiva ou de uma classe só", () => {
    expect(validarSenha("aaaaaaaaaaaa")).not.toBeNull();
    expect(validarSenha("abcdefghijkl")).not.toBeNull();
    expect(validarSenha("0102030405")).not.toBeNull();
    expect(validarSenha("abcdefGHIJKL")).toBeNull(); // maiúsculas + minúsculas bastam
  });

  it("recusa senha feita com o e-mail ou o nome da pessoa", () => {
    expect(validarSenha("fulanodetal2003!", { email: "fulanodetal2003@exemplo.com" })).toMatch(/e-mail/);
    expect(validarSenha("Beltrano-1234567", { nome: "Beltrano Silva" })).toMatch(/nome/);
    expect(validarSenha("Cafe-com-Leite-92", { email: "fulanodetal2003@exemplo.com", nome: "Fulano de Tal" })).toBeNull();
  });

  it("recusa valores que não são texto", () => {
    expect(validarSenha(undefined)).not.toBeNull();
    expect(validarSenha(123456789012)).not.toBeNull();
  });
});

describe("proteção contra adivinhar senha", () => {
  const relogio = (inicio = 1_000_000) => {
    let t = inicio;
    return { agora: () => t, avancar: (ms: number) => (t += ms) };
  };

  it("bloqueia a conta depois de muitas falhas e libera depois do tempo", () => {
    const r = relogio();
    const p = criarProtecaoLogin({ maxFalhas: 3, bloqueioMs: 60_000, agora: r.agora });
    expect(p.falhou("a@x.com").bloqueouAgora).toBe(false);
    p.falhou("a@x.com");
    expect(p.falhou("a@x.com")).toEqual({ total: 3, bloqueouAgora: true });
    const estado = p.verificar("a@x.com", "9.9.9.9");
    expect(estado.bloqueado).toBe(true);
    expect(estado.segundos).toBe(60);

    r.avancar(61_000);
    expect(p.verificar("a@x.com", "9.9.9.9").bloqueado).toBe(false);
  });

  it("não distingue maiúsculas nem espaços no e-mail", () => {
    const p = criarProtecaoLogin({ maxFalhas: 2 });
    p.falhou("Rafael@X.com ");
    p.falhou(" rafael@x.com");
    expect(p.verificar("RAFAEL@x.com", "1.1.1.1").bloqueado).toBe(true);
  });

  it("falhas antigas saem da janela e não somam", () => {
    const r = relogio();
    const p = criarProtecaoLogin({ maxFalhas: 3, janelaMs: 60_000, agora: r.agora });
    p.falhou("a@x.com");
    p.falhou("a@x.com");
    r.avancar(120_000);
    expect(p.falhou("a@x.com")).toEqual({ total: 1, bloqueouAgora: false });
  });

  it("o dono, que já entrou por um endereço, não fica trancado por um invasor", () => {
    const p = criarProtecaoLogin({ maxFalhas: 2 });
    p.sucesso("dono@x.com", "177.1.2.3");
    p.falhou("dono@x.com");
    p.falhou("dono@x.com"); // invasor, de outro endereço
    expect(p.verificar("dono@x.com", "203.0.113.9").bloqueado).toBe(true); // o invasor segue barrado
    expect(p.verificar("dono@x.com", "177.1.2.3").bloqueado).toBe(false); // o dono continua entrando
    expect(p.verificar("dono@x.com", null).bloqueado).toBe(true);
  });

  it("uma entrada bem-sucedida zera as falhas e o bloqueio", () => {
    const p = criarProtecaoLogin({ maxFalhas: 2 });
    p.falhou("a@x.com");
    p.falhou("a@x.com");
    p.sucesso("a@x.com", "1.1.1.1");
    expect(p.verificar("a@x.com", "2.2.2.2").bloqueado).toBe(false);
    expect(p.falhou("a@x.com").total).toBe(1);
  });

  it("e-mail desconhecido é tratado igual a um conhecido (sem pista para o invasor)", () => {
    const p = criarProtecaoLogin({ maxFalhas: 2 });
    p.falhou("ninguem@x.com");
    p.falhou("ninguem@x.com");
    expect(p.verificar("ninguem@x.com", "1.1.1.1").bloqueado).toBe(true);
  });

  it("não cresce sem limite quando alguém testa milhares de e-mails", () => {
    const p = criarProtecaoLogin({ maxContas: 100 });
    for (let i = 0; i < 1000; i++) p.falhou(`lixo${i}@x.com`);
    // As mais antigas foram descartadas; as mais novas continuam registradas.
    expect(p.falhou("lixo999@x.com").total).toBe(2);
    expect(p.falhou("lixo0@x.com").total).toBe(1);
  });
});

describe("origem dos pedidos", () => {
  const pedido = (headers: Record<string, string>) =>
    new Request("http://sistema.local/api/upload", { method: "POST", headers });

  it("aceita pedido sem Origin e do mesmo endereço", () => {
    expect(origemInvalida(pedido({ host: "sistema.local" }))).toBe(false);
    expect(origemInvalida(pedido({ host: "sistema.local", origin: "http://sistema.local" }))).toBe(false);
    expect(
      origemInvalida(pedido({ host: "interno:3000", "x-forwarded-host": "sistema.local", origin: "https://sistema.local" })),
    ).toBe(false);
  });

  it("recusa Origin de outro site, 'null' e lixo", () => {
    expect(origemInvalida(pedido({ host: "sistema.local", origin: "https://site-malicioso.com" }))).toBe(true);
    expect(origemInvalida(pedido({ host: "sistema.local", origin: "https://sistema.local.site-malicioso.com" }))).toBe(true);
    expect(origemInvalida(pedido({ host: "sistema.local", origin: "null" }))).toBe(true);
    expect(origemInvalida(pedido({ host: "sistema.local", origin: "não é url" }))).toBe(true);
  });
});

describe("número de página vindo da URL", () => {
  it("devolve sempre um inteiro entre 1 e o teto", () => {
    expect(paginaValida("3")).toBe(3);
    expect(paginaValida(7)).toBe(7);
    expect(paginaValida("2.9")).toBe(2);
    for (const ruim of ["abc", "", "-5", "0", "NaN", undefined, null, {}, "Infinity"]) expect(paginaValida(ruim)).toBe(1);
    expect(paginaValida("1e99")).toBe(100_000);
  });
});

describe("política de segurança de conteúdo (CSP)", () => {
  const diretiva = (csp: string, nome: string) => csp.split("; ").find((d) => d.startsWith(nome + " ")) ?? "";

  it("scripts só rodam com o código do pedido, sem 'unsafe-inline' nem 'unsafe-eval' em produção", () => {
    const csp = montarCsp({ nonce: "abc123" });
    const scripts = diretiva(csp, "script-src");
    expect(scripts).toContain("'nonce-abc123'");
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain("unsafe-inline");
    expect(scripts).not.toContain("unsafe-eval");
  });

  it("só o desenvolvimento libera 'unsafe-eval' e websockets", () => {
    const dev = montarCsp({ nonce: "x", desenvolvimento: true });
    expect(diretiva(dev, "script-src")).toContain("'unsafe-eval'");
    expect(diretiva(dev, "connect-src")).toContain("ws:");
    expect(diretiva(montarCsp({ nonce: "x" }), "connect-src")).not.toContain("ws:");
  });

  it("bloqueia incorporação em outros sites, plugins e troca de base", () => {
    const csp = montarCsp({ nonce: "x" });
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it("só força https quando o sistema está em https (senão quebraria o acesso por http)", () => {
    expect(montarCsp({ nonce: "x" })).not.toContain("upgrade-insecure-requests");
    expect(montarCsp({ nonce: "x", https: true })).toContain("upgrade-insecure-requests");
  });

  it("gera um código diferente a cada pedido", () => {
    const codigos = new Set(Array.from({ length: 200 }, () => novoNonce()));
    expect(codigos.size).toBe(200);
    for (const c of codigos) expect(c).toMatch(/^[A-Za-z0-9+/]{22}==$/);
  });
});
