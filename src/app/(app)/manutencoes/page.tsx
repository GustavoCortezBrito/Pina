import { PlusIcon, WrenchIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { PRIORIDADE, STATUS_MANUTENCAO } from "@/lib/labels";
import { cn } from "@/lib/utils";

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

export const metadata: Metadata = { title: "Manutenções" };

const ORDEM_STATUS = { ABERTA: 0, EM_ANDAMENTO: 1, CONCLUIDA: 2, CANCELADA: 3 } as const;
const ORDEM_PRIORIDADE = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 } as const;

export default async function ManutencoesPage() {
  const manutencoes = (
    await db.manutencao.findMany({
      orderBy: { abertaEm: "desc" },
      include: { imovel: { select: { codigo: true, titulo: true } } },
    })
  ).sort(
    (a, b) =>
      ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] ||
      ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manutenções"
        description="Chamados de manutenção por imóvel."
        actions={
          <Button size="lg" disabled title="Cadastro de manutenções em desenvolvimento">
            <PlusIcon /> Nova manutenção
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {manutencoes.map((item, index) => {
          const status = STATUS_MANUTENCAO[item.status];
          const prioridade = PRIORIDADE[item.prioridade];
          return (
            <Card
              key={item.id}
              className={cn(
                "animate-in border-l-4 transition-all duration-500 fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-0.5 hover:shadow-md",
                TONE_BORDER[prioridade.tone],
              )}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-full",
                    TONE_ICON_BG[status.tone],
                  )}
                >
                  <WrenchIcon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-base font-semibold">{item.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.imovel.codigo} · aberta em {formatDate(item.abertaEm)}
                    {item.concluidaEm && ` · concluída em ${formatDate(item.concluidaEm)}`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge label={status.label} tone={status.tone} />
                    <StatusBadge label={prioridade.label} tone={prioridade.tone} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
