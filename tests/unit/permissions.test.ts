import { describe, expect, it } from "vitest";
import { ACESSO, can, homeFor, normalizeRole, podeExcluirArquivo, ROLES, type Modulo } from "@/lib/permissions";

const modulosDe = (role: string) => (Object.keys(ACESSO) as Modulo[]).filter((m) => can(role, m)).sort();

describe("perfis de acesso", () => {
  it("o operador faz o dia a dia, mas não vê despesas, relatórios nem histórico", () => {
    expect(modulosDe(ROLES.OPERADOR)).toEqual(
      ["cobrancas", "contratos", "empreendimentos", "imoveis", "manutencoes", "pessoas"].sort(),
    );
  });

  it("o gerente tem tudo do operador e mais despesas, relatórios, histórico e publicação no site", () => {
    const operador = modulosDe(ROLES.OPERADOR);
    const gerente = modulosDe(ROLES.GERENTE);
    expect(gerente).toEqual(expect.arrayContaining(operador));
    expect(gerente.filter((m) => !operador.includes(m)).sort()).toEqual(
      ["despesas", "historico", "publicarSite", "relatorios"].sort(),
    );
  });

  it("só o administrador acessa usuários e configurações", () => {
    for (const modulo of ["usuarios", "configuracoes"] as const) {
      expect(can(ROLES.ADMIN, modulo)).toBe(true);
      expect(can(ROLES.GERENTE, modulo)).toBe(false);
      expect(can(ROLES.OPERADOR, modulo)).toBe(false);
      expect(can(ROLES.SITE, modulo)).toBe(false);
    }
  });

  it("o editor do site só mexe em imóveis, fotos e publicação", () => {
    expect(modulosDe(ROLES.SITE)).toEqual(["empreendimentos", "imoveis", "publicarSite"]);
  });

  it("papel desconhecido é tratado como operador (nunca como administrador)", () => {
    expect(normalizeRole("qualquer-coisa")).toBe(ROLES.OPERADOR);
    expect(normalizeRole(null)).toBe(ROLES.OPERADOR);
    expect(can("qualquer-coisa", "configuracoes")).toBe(false);
  });

  it("quem não gerencia contratos começa em Imóveis; os demais, no painel", () => {
    expect(homeFor(ROLES.ADMIN)).toBe("/painel");
    expect(homeFor(ROLES.GERENTE)).toBe("/painel");
    expect(homeFor(ROLES.OPERADOR)).toBe("/painel");
    expect(homeFor(ROLES.SITE)).toBe("/imoveis");
  });
});

describe("excluir arquivos", () => {
  const documento = { categoria: "CONTRATO_ASSINADO", imovelId: null };
  const documentoDoImovel = { categoria: "DOCUMENTO", imovelId: "i1" };
  const fotoDoImovel = { categoria: "FOTO", imovelId: "i1" };
  const fotoDePerfil = { categoria: "FOTO_PERFIL", imovelId: null };

  it("o administrador exclui qualquer arquivo", () => {
    for (const arquivo of [documento, documentoDoImovel, fotoDoImovel, fotoDePerfil]) {
      expect(podeExcluirArquivo(ROLES.ADMIN, arquivo)).toBe(true);
    }
  });

  it("gerente, operador e editor do site não excluem documentos", () => {
    for (const role of [ROLES.GERENTE, ROLES.OPERADOR, ROLES.SITE]) {
      expect(podeExcluirArquivo(role, documento)).toBe(false);
      expect(podeExcluirArquivo(role, documentoDoImovel)).toBe(false);
      expect(podeExcluirArquivo(role, fotoDePerfil)).toBe(false);
    }
  });

  it("a exceção: quem cuida de imóveis pode trocar uma foto do imóvel", () => {
    for (const role of [ROLES.GERENTE, ROLES.OPERADOR, ROLES.SITE]) {
      expect(podeExcluirArquivo(role, fotoDoImovel)).toBe(true);
    }
  });

  it("papel desconhecido ou ausente não exclui documentos", () => {
    expect(podeExcluirArquivo(null, documentoDoImovel)).toBe(false);
    expect(podeExcluirArquivo("admin ", documentoDoImovel)).toBe(false);
  });
});
