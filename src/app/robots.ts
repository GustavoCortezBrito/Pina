import type { MetadataRoute } from "next";

/** O site público (início e imóveis) pode ser indexado; o painel e o login ficam de fora. */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.BETTER_AUTH_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/imovel/"],
        disallow: [
          "/api/",
          "/login",
          "/painel",
          "/imoveis",
          "/empreendimentos",
          "/pessoas",
          "/contratos",
          "/financeiro",
          "/relatorios",
          "/historico",
          "/configuracoes",
          "/perfil",
        ],
      },
    ],
    sitemap: base ? `${base.replace(/\/$/, "")}/sitemap.xml` : undefined,
  };
}
