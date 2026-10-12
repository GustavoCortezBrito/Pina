import { HouseIcon, SearchXIcon } from "lucide-react";
import type { Metadata } from "next";
import { ClearFilters, FilterBar, FilterSelect } from "@/components/shared/filters";
import { Pagination } from "@/components/shared/pagination";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { VitrineCard } from "@/features/vitrine/components/vitrine-card";
import { bairrosDaVitrine, listarVitrine } from "@/features/vitrine/queries";
import { TipoImovel } from "@/generated/prisma/enums";
import { options, TIPO_IMOVEL } from "@/lib/labels";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Imóveis para alugar em Barretos/SP",
  description: "Casas, apartamentos e salas comerciais disponíveis para locação — Pina's Empreendimentos.",
};

// A vitrine muda quando um imóvel é publicado, alugado ou tem as fotos trocadas.
export const dynamic = "force-dynamic";

const QUARTOS = [1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}+ quarto${n > 1 ? "s" : ""}` }));
const PRECOS = [800, 1000, 1500, 2000, 3000, 5000].map((v) => ({
  value: String(v),
  label: `Até R$ ${v.toLocaleString("pt-BR")}`,
}));

export default async function VitrinePage(props: PageProps<"/vitrine">) {
  const params = await props.searchParams;
  const ler = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);
  const tipo = Object.values(TipoImovel).includes(ler("tipo") as TipoImovel)
    ? (ler("tipo") as TipoImovel)
    : undefined;

  const [{ itens, total, page, pageCount }, bairros, { site }] = await Promise.all([
    listarVitrine({
      tipo,
      quartos: Number(ler("quartos")) || undefined,
      precoMax: Number(ler("preco")) || undefined,
      bairro: ler("bairro"),
      page: Number(ler("page") ?? 1),
    }),
    bairrosDaVitrine(),
    getSettings(),
  ]);

  const temFiltro = Boolean(tipo || ler("quartos") || ler("preco") || ler("bairro"));

  return (
    <>
      <section className="surface-brand relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h1 className="max-w-2xl animate-fade-up text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Seu próximo <span className="text-gradient-brand">lugar para morar ou trabalhar</span>
          </h1>
          <p className="mt-4 max-w-xl animate-fade-up text-base text-white/70 [animation-delay:80ms] sm:text-lg">
            {site.chamada}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <FilterBar>
          <FilterSelect param="tipo" placeholder="Tipo" options={options(TIPO_IMOVEL)} />
          <FilterSelect param="quartos" placeholder="Quartos" options={QUARTOS} />
          <FilterSelect param="preco" placeholder="Valor" options={PRECOS} allLabel="Qualquer" />
          {bairros.length > 1 && (
            <FilterSelect param="bairro" placeholder="Bairro" options={bairros.map((b) => ({ value: b, label: b }))} />
          )}
          <ClearFilters />
        </FilterBar>

        {itens.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">{temFiltro ? <SearchXIcon /> : <HouseIcon />}</EmptyMedia>
              <EmptyTitle>{temFiltro ? "Nenhum imóvel com esses filtros" : "Em breve, novos imóveis"}</EmptyTitle>
              <EmptyDescription>
                {temFiltro
                  ? "Tente mudar ou limpar os filtros."
                  : "No momento não há imóveis disponíveis. Fale com a gente pelo WhatsApp para saber das próximas vagas."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? "imóvel disponível" : "imóveis disponíveis"}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {itens.map((imovel, i) => (
                <VitrineCard key={imovel.id} imovel={imovel} index={i} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} total={total} label="imóveis" />
          </>
        )}
      </main>
    </>
  );
}
