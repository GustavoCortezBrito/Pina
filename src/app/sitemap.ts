import type { MetadataRoute } from "next";
import { imoveisParaSitemap } from "@/features/vitrine/queries";

// Lê os imóveis publicados na hora do pedido (não no build).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  const imoveis = await imoveisParaSitemap();
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    ...imoveis.map((i) => ({
      url: `${base}/imovel/${i.id}`,
      lastModified: i.atualizadoEm,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
