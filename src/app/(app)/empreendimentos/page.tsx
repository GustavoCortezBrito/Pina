import { BuildingIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { listarEmpreendimentos } from "@/features/empreendimentos/queries";
import { formatEndereco } from "@/lib/format";

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {empreendimentos.map((empreendimento, index) => (
            <Link
              key={empreendimento.id}
              href={`/empreendimentos/${empreendimento.id}`}
              className="animate-in fade-in slide-in-from-bottom-2 block rounded-xl duration-500 fill-mode-both"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">{empreendimento.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatEndereco(empreendimento)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {empreendimento.alugadas} de {empreendimento.unidades} unidades ocupadas
                      </span>
                      <span className="font-medium text-foreground">{empreendimento.ocupacao}%</span>
                    </div>
                    <Progress value={empreendimento.ocupacao} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
