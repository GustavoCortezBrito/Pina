import { WrenchIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ManutencaoDialog } from "@/features/manutencoes/components/manutencao-dialog";
import { ManutencaoStatusSelect } from "@/features/manutencoes/components/status-select";
import { listarManutencoes } from "@/features/manutencoes/queries";
import { opcoesImoveis } from "@/features/imoveis/queries";
import { formatDate } from "@/lib/dates";
import { PRIORIDADE, STATUS_MANUTENCAO } from "@/lib/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Manutenções" };

const TONE_ICON_BG: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  warning: "bg-amber-500/20 text-amber-800 dark:text-amber-300",
  danger: "bg-red-500/15 text-red-700 dark:text-red-300",
  primary: "bg-primary/15 text-primary",
  neutral: "bg-muted text-muted-foreground",
};

const TONE_BORDER: Record<string, string> = {
  success: "border-l-emerald-500",
  info: "border-l-sky-500",
  warning: "border-l-amber-500",
  danger: "border-l-red-500",
  primary: "border-l-primary",
  neutral: "border-l-muted-foreground/30",
};

export default async function ManutencoesPage() {
  const [manutencoes, imoveis] = await Promise.all([listarManutencoes(), opcoesImoveis()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manutenções"
        description="Chamados de manutenção por imóvel."
        actions={<ManutencaoDialog imoveis={imoveis} />}
      />

      {manutencoes.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WrenchIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma manutenção registrada</EmptyTitle>
            <EmptyDescription>Registre o primeiro chamado de manutenção.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {manutencoes.map((item, index) => {
            const status = STATUS_MANUTENCAO[item.status];
            const prioridade = PRIORIDADE[item.prioridade];
            return (
              <Card
                key={item.id}
                className={cn(
                  "animate-in fade-in slide-in-from-bottom-2 border-l-4 duration-500 fill-mode-both transition-all hover:-translate-y-0.5 hover:shadow-md",
                  TONE_BORDER[prioridade.tone],
                )}
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <CardContent className="flex items-start gap-4 p-5 sm:p-6">
                  <span
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full",
                      TONE_ICON_BG[status.tone],
                    )}
                  >
                    <WrenchIcon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-lg font-semibold">{item.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.imovel.codigo} · aberta em {formatDate(item.abertaEm)}
                      {item.concluidaEm && ` · concluída em ${formatDate(item.concluidaEm)}`}
                    </p>
                    {item.descricao && <p className="text-sm text-muted-foreground">{item.descricao}</p>}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ManutencaoStatusSelect id={item.id} status={item.status} />
                      <StatusBadge label={prioridade.label} tone={prioridade.tone} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
