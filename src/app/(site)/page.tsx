import { HouseIcon, MapPinIcon, SearchXIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClearFilters, FilterSelect } from "@/components/shared/filters";
import { Pagination } from "@/components/shared/pagination";
import { Revelar } from "@/features/vitrine/components/animacao";
import { ChamadaFinal } from "@/features/vitrine/components/chamada-final";
import { ComoFunciona } from "@/features/vitrine/components/como-funciona";
import { Hero } from "@/features/vitrine/components/hero";
import { TipoTabs } from "@/features/vitrine/components/tipo-tabs";
import { TiposDestaque } from "@/features/vitrine/components/tipos-destaque";
import { VitrineCard } from "@/features/vitrine/components/vitrine-card";
import { WhatsappIcon } from "@/features/vitrine/components/whatsapp-icon";
import {
  bairrosDaVitrine,
  capasPorTipo,
  destaqueVitrine,
  listarVitrine,
  resumoVitrine,
} from "@/features/vitrine/queries";
import { linkWhatsapp } from "@/features/vitrine/whatsapp";
import { TipoImovel } from "@/generated/prisma/enums";
import { options, TIPO_IMOVEL } from "@/lib/labels";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Imóveis para alugar em Barretos/SP · Pina's Empreendimentos" },
  description: "Casas, apartamentos e salas comerciais disponíveis para locação — Pina's Empreendimentos.",
  openGraph: { images: ["/site/hero.webp"] },
};

// O site muda quando um imóvel é publicado, alugado ou tem as fotos trocadas.
export const dynamic = "force-dynamic";

const QUARTOS = [1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}+ quarto${n > 1 ? "s" : ""}` }));
const PRECOS = [800, 1000, 1500, 2000, 3000, 5000].map((v) => ({
  value: String(v),
  label: `Até R$ ${v.toLocaleString("pt-BR")}`,
}));

export default async function SitePage(props: PageProps<"/">) {
  const params = await props.searchParams;
  const ler = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);
  const tipo = Object.values(TipoImovel).includes(ler("tipo") as TipoImovel)
    ? (ler("tipo") as TipoImovel)
    : undefined;

  const [{ itens, total, page, pageCount }, bairros, resumo, capas, destaque, { site, locador }] = await Promise.all([
    listarVitrine({
      tipo,
      quartos: Number(ler("quartos")) || undefined,
      precoMax: Number(ler("preco")) || undefined,
      bairro: ler("bairro"),
      page: Number(ler("page") ?? 1),
    }),
    bairrosDaVitrine(),
    resumoVitrine(),
    capasPorTipo(),
    destaqueVitrine(),
    getSettings(),
  ]);

  const whats = linkWhatsapp(site.whatsapp);
  const cidade = locador.cidade || "Barretos/SP";
  const temFiltro = Boolean(tipo || ler("quartos") || ler("preco") || ler("bairro"));

  // Atalhos por tipo: mantém os outros filtros e troca só o tipo.
  const hrefTipo = (t?: TipoImovel) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && k !== "tipo" && k !== "page") q.set(k, v);
    if (t) q.set("tipo", t);
    const s = q.toString();
    return `/${s ? `?${s}` : ""}#imoveis`;
  };
  const tiposComImovel = (Object.keys(TIPO_IMOVEL) as TipoImovel[]).filter((t) => (resumo.porTipo[t] ?? 0) > 0);
  const abas = [undefined, ...tiposComImovel].map((t) => ({
    chave: t ?? "todos",
    rotulo: t ? TIPO_IMOVEL[t] : "Todos",
    total: t ? (resumo.porTipo[t] ?? 0) : resumo.total,
    href: hrefTipo(t),
    ativo: tipo === t,
  }));

  return (
    <>
      <Hero total={resumo.total} cidade={cidade} chamada={site.chamada} whats={whats} destaque={destaque} />

      {/* ---------- Busca flutuante ---------- */}
      <div className="relative z-10 mx-auto -mt-28 max-w-7xl px-4 sm:px-6">
        <Revelar y={36} atraso={1.2} duracao={0.9} aoCarregar>
          <div className="rounded-[2rem] bg-card/85 p-5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.45)] ring-1 ring-border backdrop-blur-2xl sm:p-7">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-primary-ink uppercase">Busca</p>
                <h2 className="mt-1 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                  Encontre o seu próximo endereço
                </h2>
              </div>
              <ClearFilters />
            </div>

            {tiposComImovel.length > 1 && <TipoTabs abas={abas} />}

            <div
              className={cn(
                "mt-5 grid grid-cols-2 gap-2.5 [&_button[role=combobox]]:h-12 [&_button[role=combobox]]:w-full [&_button[role=combobox]]:rounded-xl [&_button[role=combobox]]:bg-background/70",
                tiposComImovel.length > 1 ? "lg:grid-cols-3" : "lg:grid-cols-4",
              )}
            >
              {tiposComImovel.length <= 1 && (
                <FilterSelect param="tipo" placeholder="Tipo" options={options(TIPO_IMOVEL)} />
              )}
              <FilterSelect param="quartos" placeholder="Quartos" options={QUARTOS} />
              <FilterSelect param="preco" placeholder="Valor" options={PRECOS} allLabel="Qualquer" />
              {bairros.length > 1 ? (
                <FilterSelect param="bairro" placeholder="Bairro" options={bairros.map((b) => ({ value: b, label: b }))} />
              ) : (
                <div className="col-span-2 hidden items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground lg:col-span-1 lg:flex">
                  <MapPinIcon className="size-4 text-primary-ink" /> {cidade}
                </div>
              )}
            </div>
          </div>
        </Revelar>
      </div>

      {/* ---------- Explore por tipo (só quando há mais de um tipo e nenhum filtro) ---------- */}
      {!temFiltro && capas.length > 1 && <TiposDestaque capas={capas} />}

      {/* ---------- Resultados ---------- */}
      <main id="imoveis" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-6">
        <Revelar className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary-ink uppercase">
              {tipo ? TIPO_IMOVEL[tipo] : "Disponíveis"}
            </p>
            <h2 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
              {temFiltro ? "Resultado da busca" : "Imóveis para alugar"}
            </h2>
          </div>
          {itens.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{total}</span>{" "}
              {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
            </p>
          )}
        </Revelar>

        {itens.length === 0 ? (
          <Revelar y={32}>
            <div className="relative overflow-hidden rounded-[2rem] border border-dashed bg-card/60 px-6 py-16 text-center sm:py-20">
              <span aria-hidden className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
              <div className="relative mx-auto max-w-md">
                <span className="relative mx-auto flex size-20 items-center justify-center">
                  <span className="absolute inset-0 animate-glow rounded-full bg-primary/25 blur-xl" />
                  <span className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-brand-deep text-primary-foreground shadow-xl shadow-primary/30">
                    {temFiltro ? <SearchXIcon className="size-9" /> : <HouseIcon className="size-9" />}
                  </span>
                </span>
                <h3 className="mt-7 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                  {temFiltro ? "Nenhum imóvel com esses filtros" : "Em breve, novos imóveis"}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {temFiltro
                    ? "Tente mudar ou limpar os filtros para ver mais opções."
                    : "No momento não há imóveis disponíveis. Fale com a gente pelo WhatsApp para saber das próximas vagas."}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {temFiltro && (
                    <Link
                      href="/#imoveis"
                      scroll={false}
                      className="inline-flex h-12 items-center rounded-full border bg-background px-6 font-semibold transition-colors hover:border-primary/60"
                    >
                      Ver todos os imóveis
                    </Link>
                  )}
                  {whats && (
                    <a
                      href={whats}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-whatsapp inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold transition-all hover:-translate-y-0.5"
                    >
                      <WhatsappIcon /> Perguntar pelo WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Revelar>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {itens.map((imovel, i) => (
                <VitrineCard key={imovel.id} imovel={imovel} index={i} />
              ))}
            </div>
            <div className="mt-10">
              <Pagination page={page} pageCount={pageCount} total={total} label="imóveis" />
            </div>
          </>
        )}
      </main>

      <ComoFunciona />

      {whats && <ChamadaFinal whats={whats} />}
    </>
  );
}
