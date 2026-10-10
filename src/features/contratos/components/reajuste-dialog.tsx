"use client";

import { RefreshCwIcon } from "lucide-react";
import * as React from "react";
import { PercentInput } from "@/components/shared/inputs";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { aplicarReajuste } from "@/features/contratos/actions";
import { calcularNovoValor, proximoReajuste } from "@/features/contratos/services/reajuste";
import type { IndiceReajuste } from "@/generated/prisma/enums";
import { toISODate, today } from "@/lib/dates";
import { INDICE_REAJUSTE } from "@/lib/labels";
import { formatBRL } from "@/lib/money";

export function ReajusteDialog({
  contratoId,
  valorAtual,
  indiceReajuste,
  dataInicio,
  dataFim,
  reajustesAplicados,
}: {
  contratoId: string;
  valorAtual: number;
  indiceReajuste: IndiceReajuste;
  dataInicio: Date;
  dataFim: Date;
  reajustesAplicados: number;
}) {
  const { pending, run } = useAction();
  const [aberto, setAberto] = React.useState(false);
  const sugestao = React.useMemo(
    () => proximoReajuste({ dataInicio, dataFim, indice: indiceReajuste, reajustesAplicados }) ?? today(),
    [dataInicio, dataFim, indiceReajuste, reajustesAplicados],
  );
  const [dataAplicacao, setDataAplicacao] = React.useState(toISODate(sugestao));
  const [percentual, setPercentual] = React.useState<number | null>(null);

  const valorNovo = percentual != null ? calcularNovoValor(valorAtual, percentual) : null;

  async function confirmar() {
    if (percentual == null) return;
    const result = await run(() => aplicarReajuste({ contratoId, percentual, dataAplicacao }));
    if (result.ok) setAberto(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RefreshCwIcon /> Aplicar reajuste
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicar reajuste</DialogTitle>
          <DialogDescription>
            Índice contratual: {INDICE_REAJUSTE[indiceReajuste]}. Informe o percentual acumulado dos últimos
            12 meses para calcular o novo valor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="data-reajuste">Data de aplicação</Label>
              <Input
                id="data-reajuste"
                type="date"
                value={dataAplicacao}
                onChange={(event) => setDataAplicacao(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="percentual-reajuste">Percentual do índice</Label>
              <PercentInput id="percentual-reajuste" value={percentual} onChange={setPercentual} />
            </div>
          </div>

          <div className="space-y-1.5 rounded-lg border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor atual</span>
              <span className="tabular-nums">{formatBRL(valorAtual)}</span>
            </div>
            <div className="flex justify-between border-t pt-1.5 font-semibold">
              <span>Novo valor</span>
              <span className="tabular-nums">{valorNovo != null ? formatBRL(valorNovo) : "—"}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={pending || percentual == null}>
            {pending && <Spinner />}
            Aplicar reajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
