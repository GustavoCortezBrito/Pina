import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  LoaderIcon,
  WalletIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import type { StatusManutencao } from "@/generated/prisma/enums";
import { formatDate } from "@/lib/dates";
import { PRIORIDADE, STATUS_MANUTENCAO } from "@/lib/labels";
import { formatBRL, sum } from "@/lib/money";
import { TONE_CARD, TONE_ICON } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { ImovelDetalhe } from "../queries";

const ICONE: Record<StatusManutencao, React.ComponentType<{ className?: string }>> = {
  ABERTA: CircleDashedIcon,
  EM_ANDAMENTO: LoaderIcon,
  CONCLUIDA: CheckCircle2Icon,
  CANCELADA: XCircleIcon,
};

export function AbaManutencoes({
  manutencoes,
  verDespesas,
}: {
  manutencoes: ImovelDetalhe["manutencoes"];
  verDespesas: boolean;
}) {
  if (manutencoes.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma manutenção registrada.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {manutencoes.map((m, index) => {
        const status = STATUS_MANUTENCAO[m.status];
        const prioridade = PRIORIDADE[m.prioridade];
        const Icone = ICONE[m.status];
        const gasto = sum(m.despesas.map((d) => d.valor));

        return (
          <Link
            key={m.id}
            href={`/financeiro/despesas?aba=manutencoes&destaque=${m.id}#manutencao-${m.id}`}
            className="group block animate-fade-up rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <Card
              className={cn(
                "h-full gap-3 p-5 duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-primary/40",
                TONE_CARD[status.tone],
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", TONE_ICON[status.tone])}>
                    <Icone className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-bold">{m.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      aberta em {formatDate(m.abertaEm)}
                      {m.concluidaEm && ` · concluída em ${formatDate(m.concluidaEm)}`}
                    </p>
                  </div>
                </div>
                <StatusBadge label={status.label} tone={status.tone} />
              </div>

              {m.descricao && <p className="line-clamp-2 text-sm text-muted-foreground">{m.descricao}</p>}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={`Prioridade ${prioridade.label.toLowerCase()}`} tone={prioridade.tone} />
                  {verDespesas && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <WalletIcon className="size-4" />
                      {m.despesas.length === 0 ? "Sem despesas" : `${m.despesas.length} despesa(s)`}
                      {m.despesas.length > 0 && <strong className="text-foreground tabular-nums">{formatBRL(gasto)}</strong>}
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary-ink">
                  Abrir <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
