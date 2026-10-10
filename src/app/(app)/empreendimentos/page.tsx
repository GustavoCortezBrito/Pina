import { BuildingIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EmpreendimentoCard } from "@/features/empreendimentos/components/empreendimento-card";
import { listarEmpreendimentos } from "@/features/empreendimentos/queries";

export const metadata: Metadata = { title: "Empreendimentos" };

export default async function EmpreendimentosPage() {
  const empreendimentos = await listarEmpreendimentos();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empreendimentos"
        description="Prédios e condomínios com várias unidades."
        actions={
          <Button size="lg" asChild>
            <Link href="/empreendimentos/novo">
              <PlusIcon /> Novo empreendimento
            </Link>
          </Button>
        }
      />

      {empreendimentos.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BuildingIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum empreendimento cadastrado</EmptyTitle>
            <EmptyDescription>
              Cadastre um prédio ou condomínio para agrupar as unidades dentro dele.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {empreendimentos.map((empreendimento, index) => (
            <EmpreendimentoCard
              key={empreendimento.id}
              empreendimento={empreendimento}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
