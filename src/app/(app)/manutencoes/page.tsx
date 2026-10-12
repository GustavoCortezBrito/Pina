import {
  CheckCircle2Icon,
  CircleDashedIcon,
  LoaderIcon,
  WalletIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { categoriasAtivas } from "@/features/financeiro/despesas/queries";
import { opcoesImoveis } from "@/features/imoveis/queries";
import { DespesaDaManutencao } from "@/features/manutencoes/components/despesa-da-manutencao";
import { ManutencaoDialog } from "@/features/manutencoes/components/manutencao-dialog";
import { ManutencaoStatusSelect } from "@/features/manutencoes/components/status-select";
import { listarManutencoes } from "@/features/manutencoes/queries";
import type { StatusManutencao } from "@/generated/prisma/enums";
import { formatDate } from "@/lib/dates";
import { PRIORIDADE, STATUS_MANUTENCAO } from "@/lib/labels";
import { formatBRL, sum } from "@/lib/money";
import { can } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { TONE_BADGE, TONE_CARD, TONE_FIELD, TONE_ICON } from "@/lib/tones";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Manutenções" };

const ICONE: Record<StatusManutencao, React.ComponentType<{ className?: string }>> = {
  ABERTA: CircleDashedIcon,
  EM_ANDAMENTO: LoaderIcon,
  CONCLUIDA: CheckCircle2Icon,
  CANCELADA: XCircleIcon,
};

// A cor do card segue o andamento (mesmas cores de status do sistema todo).
function estiloDe(status: StatusManutencao) {
  const tone = STATUS_MANUTENCAO[status].tone;
  return {
    icon: ICONE[status],
    card: TONE_CARD[tone],
    iconBox: TONE_ICON[tone],
    select: TONE_FIELD[tone],
    chip: TONE_BADGE[tone],
  };
}

export default async function ManutencoesPage() {
  const [user, manutencoes, imoveis, categorias] = await Promise.all([
    requireUser(),
    listarManutencoes(),
    opcoesImoveis(),
    categoriasAtivas(),
  ]);
  const verDespesas = can(user.role, "despesas");
  const categoriasOptions = categorias.map((c) => ({ value: c.id, label: c.nome }));

  const contagem = (status: StatusManutencao) => manutencoes.filter((m) => m.status === status).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manutenções"
        description="Chamados de manutenção por imóvel."
        actions={<ManutencaoDialog imoveis={imoveis} />}
      />

      {manutencoes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ICONE) as StatusManutencao[]).map((status) => {
            const Icon = estiloDe(status).icon;
            return (
              <span
                key={status}
                className={cn(
                  "inline-flex animate-scale-in items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
                  estiloDe(status).chip,
                )}
              >
                <Icon className="size-4" />
                {STATUS_MANUTENCAO[status].label}
                <span className="tabular-nums">{contagem(status)}</span>
              </span>
            );
          })}
        </div>
      )}

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {manutencoes.map((item, index) => {
            const prioridade = PRIORIDADE[item.prioridade];
            const estilo = estiloDe(item.status);
            const Icon = estilo.icon;
            const totalDespesas = sum(item.despesas.map((d) => d.valor));
            return (
              <Card
                key={item.id}
                className={cn(
                  "h-full animate-fade-up py-0 duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                  estilo.card,
                )}
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", estilo.iconBox)}
                    >
                      <Icon className="size-5" />
                    </span>
                    <StatusBadge label={`Prioridade ${prioridade.label.toLowerCase()}`} tone={prioridade.tone} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-base font-semibold">{item.titulo}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.imovel.codigo} · aberta em {formatDate(item.abertaEm)}
                    </p>
                    {item.concluidaEm && (
                      <p className="text-xs text-muted-foreground">concluída em {formatDate(item.concluidaEm)}</p>
                    )}
                    {item.descricao && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{item.descricao}</p>
                    )}
                  </div>

                  {verDespesas && (
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-background/70 px-3 py-2 text-sm ring-1 ring-border">
                      <Link
                        href="/financeiro/despesas"
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <WalletIcon className="size-4" />
                        {item.despesas.length === 0
                          ? "Sem despesas"
                          : `${item.despesas.length} ${item.despesas.length === 1 ? "despesa" : "despesas"}`}
                      </Link>
                      <span className="font-bold tabular-nums">{formatBRL(totalDespesas)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 border-t pt-3">
                    <ManutencaoStatusSelect id={item.id} status={item.status} className={estilo.select} />
                    {verDespesas && item.status !== "CANCELADA" && (
                      <DespesaDaManutencao
                        imoveis={imoveis}
                        categorias={categoriasOptions}
                        manutencao={{ id: item.id, titulo: item.titulo, imovelId: item.imovel.id }}
                      />
                    )}
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
