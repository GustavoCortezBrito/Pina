import { describe, expect, it } from "vitest";
import { destinoSeguro } from "@/lib/destino";

describe("destino depois do login", () => {
  it("aceita caminhos do próprio sistema, com filtros", () => {
    expect(destinoSeguro("/contratos")).toBe("/contratos");
    expect(destinoSeguro("/financeiro/despesas?aba=manutencoes&destaque=abc")).toBe(
      "/financeiro/despesas?aba=manutencoes&destaque=abc",
    );
  });

  it("sem destino, vai para o painel", () => {
    expect(destinoSeguro(undefined)).toBe("/painel");
    expect(destinoSeguro("")).toBe("/painel");
    expect(destinoSeguro(["/contratos"])).toBe("/painel");
  });

  it("recusa endereços de outros sites, mesmo disfarçados", () => {
    for (const perigoso of [
      "https://site-malicioso.com",
      "//site-malicioso.com",
      "///site-malicioso.com",
      "/\\site-malicioso.com",
      "/\t/site-malicioso.com",
      "/\n/site-malicioso.com",
      "javascript:alert(1)",
      "contratos",
    ]) {
      expect(destinoSeguro(perigoso)).toBe("/painel");
    }
  });

  it("aceita outro padrão quando informado", () => {
    expect(destinoSeguro("//x.com", "/")).toBe("/");
  });
});
