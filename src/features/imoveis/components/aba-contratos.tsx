import {
  ArrowRightIcon,
  CalendarClockIcon,
  FileSignatureIcon,
  HandCoinsIcon,
  TrendingUpIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { CardOverlayLink } from "@/components/shared/imovel-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { formatDate, today } from "@/lib/dates";
import { formatNumeroContrato } from "@/lib/format";
import { INDICE_REAJUSTE, PAPEL_CONTRATO, STATUS_CONTRATO } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { TONE_CARD, TONE_ICON, TONE_TEXT } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { ImovelDetalhe } from "../queries";

function progresso(inicio: Date, fim: Date) {
  const total = fim.getTime() - inicio.getTime();
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((today().getTime() - inicio.getTime()) / total) * 100)));
}

export function AbaContratos({ contratos }: { contratos: ImovelDetalhe["contratos"] }) {
  if (contratos.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nenhum contrato registrado ainda.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {contratos.map((contrato, index) => {
        const status = STATUS_CONTRATO[contrato.status];
        const ativo = contrato.status === "ATIVO";
        const pct = progresso(contrato.dataInicio, contrato.dataFim);
        const numero = formatNumeroContrato(contrato.numero);

        return (
          <div
            key={contrato.id}
            className="group relative animate-fade-up rounded-xl"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <CardOverlayLink href={`/contratos/${contrato.id}`} label={`Abrir contrato nº ${numero}`} />
            <Card
              className={cn(
                "pointer-events-none h-full gap-4 p-5 duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-primary/40",
                TONE_CARD[status.tone],
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", TONE_ICON[status.tone])}>
                    <FileSignatureIcon className="size-5" />
                  </span>
                  <div>
                    <p className="text-base font-bold">Contrato nº {numero}</p>
                    <StatusBadge label={status.label} tone={status.tone} className="mt-1" />
                  </div>
                </div>
                <p className={cn("text-right text-xl font-bold tabular-nums", ativo ? TONE_TEXT.success : "text-foreground")}>
                  {formatBRL(contrato.valorAluguel)}
                  <span className="block text-xs font-medium text-muted-foreground">por mês</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {formatDate(contrato.dataInicio)} <span className="text-muted-foreground">até</span>{" "}
                    {formatDate(contrato.dataFim)}
                  </span>
                  {ativo && <span className="text-xs font-semibold text-muted-foreground tabular-nums">{pct}% do prazo</span>}
                </div>
                {ativo && (
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full origin-left animate-grow-x rounded-full bg-gradient-to-r from-primary to-brand-deep"
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <p className="flex items-center gap-2">
                  <CalendarClockIcon className="size-4 text-primary-ink" />
                  <span>
                    Vence todo dia <strong>{contrato.diaVencimento}</strong>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <TrendingUpIcon className="size-4 text-primary-ink" />
                  <span>{INDICE_REAJUSTE[contrato.indiceReajuste]}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {contrato.partes.map((parte) => (
                  <Link
                    key={parte.id}
                    href={`/pessoas/${parte.pessoa.id}`}
                    className="pointer-events-auto relative inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium ring-1 ring-border transition-colors hover:text-primary-ink hover:ring-primary/50"
                  >
                    <UserIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{PAPEL_CONTRATO[parte.papel]}:</span>
                    {parte.pessoa.nome}
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-sm font-semibold">
                <Link
                  href={`/financeiro/cobrancas/${contrato.id}`}
                  className="pointer-events-auto relative inline-flex items-center gap-1.5 text-primary-ink hover:underline"
                >
                  <HandCoinsIcon className="size-4" /> Ver cobranças
                </Link>
                <span className="inline-flex items-center gap-1 text-primary-ink">
                  Abrir contrato
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
