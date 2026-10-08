import { HouseIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { FilterBar, FilterSelect, SearchInput } from "@/components/shared/filters";
import { Pagination } from "@/components/shared/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { StatusImovel, TipoImovel } from "@/generated/prisma/enums";
import { opcoesEmpreendimentos } from "@/features/empreendimentos/queries";
import { ImovelCard } from "@/features/imoveis/components/imovel-card";
import { listarImoveis } from "@/features/imoveis/queries";
import { options, STATUS_IMOVEL, TIPO_IMOVEL } from "@/lib/labels";

export const metadata: Metadata = { title: "Imóveis" };

function enumOuIndefinido<T extends string>(valores: readonly T[], valor: string | undefined): T | undefined {
  return valores.includes(valor as T) ? (valor as T) : undefined;
}

export default async function ImoveisPage(props: PageProps<"/imoveis">) {
  const params = await props.searchParams;
  const lerParam = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);

  const filtros = {
    q: lerParam("q"),
    tipo: enumOuIndefinido(Object.values(TipoImovel), lerParam("tipo")),
    status: enumOuIndefinido(Object.values(StatusImovel), lerParam("status")),
    empreendimentoId: lerParam("empreendimento"),
    page: Number(lerParam("page") ?? 1),
  };

  const [{ itens, total, page, pageCount }, empreendimentos] = await Promise.all([
    listarImoveis(filtros),
    opcoesEmpreendimentos(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imóveis"
        description="Casas, apartamentos e kitnets cadastrados."
        actions={
          <Button size="lg" asChild>
            <Link href="/imoveis/novo">
              <PlusIcon /> Novo imóvel
            </Link>
          </Button>
        }
      />

      <FilterBar>
        <SearchInput placeholder="Buscar por código, nome ou endereço..." />
        <FilterSelect param="tipo" placeholder="Tipo" options={options(TIPO_IMOVEL)} />
        <FilterSelect
          param="status"
          placeholder="Situação"
          options={options(Object.fromEntries(Object.entries(STATUS_IMOVEL).map(([k, v]) => [k, v.label])))}
        />
        {empreendimentos.length > 0 && (
          <FilterSelect param="empreendimento" placeholder="Empreendimento" options={empreendimentos} />
        )}
      </FilterBar>

      {itens.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HouseIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum imóvel encontrado</EmptyTitle>
            <EmptyDescription>Ajuste os filtros ou cadastre o primeiro imóvel.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {itens.map((imovel, index) => (
              <ImovelCard key={imovel.id} imovel={imovel} index={index} />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} total={total} label="imóveis" />
        </>
      )}
    </div>
  );
}
