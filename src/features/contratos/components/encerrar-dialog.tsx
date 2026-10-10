"use client";

import { XCircleIcon } from "lucide-react";
import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { encerrarContrato } from "@/features/contratos/actions";
import { calcularMultaRescisoria, isRescisao } from "@/features/contratos/services/rescisao";
import { parseISODate, toISODate, today } from "@/lib/dates";
import { formatBRL } from "@/lib/money";

export function EncerrarDialog({
  contratoId,
  valorAluguel,
  multaRescisoriaMeses,
  dataInicio,
  dataFim,
}: {
  contratoId: string;
  valorAluguel: number;
  multaRescisoriaMeses: number;
  dataInicio: Date;
  dataFim: Date;
}) {
  const { pending, run } = useAction();
  const [aberto, setAberto] = React.useState(false);
  const [dataSaida, setDataSaida] = React.useState(toISODate(today()));
  const [motivo, setMotivo] = React.useState("");
  const [statusImovelApos, setStatusImovelApos] = React.useState<"DISPONIVEL" | "EM_REFORMA">("DISPONIVEL");

  const dataSaidaDate = parseISODate(dataSaida) ?? today();
  const rescisao = isRescisao(dataSaidaDate, dataFim);
  const multa = rescisao
    ? calcularMultaRescisoria({ valorAluguel, multaMeses: multaRescisoriaMeses, dataInicio, dataFim, dataSaida: dataSaidaDate })
    : null;

  async function confirmar() {
    const result = await run(() =>
      encerrarContrato({ contratoId, dataSaida, motivo: motivo || undefined, statusImovelApos }),
    );
    if (result.ok) setAberto(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <XCircleIcon /> Encerrar / rescindir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encerrar contrato</DialogTitle>
          <DialogDescription>
            {rescisao
              ? "A saída é antes do fim do contrato: isso é uma rescisão, com multa proporcional ao tempo restante."
              : "A saída é na data final do contrato (ou depois): encerramento sem multa."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="data-saida">Data de saída</Label>
              <Input id="data-saida" type="date" value={dataSaida} onChange={(e) => setDataSaida(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status-apos">Status do imóvel depois</Label>
              <Select value={statusImovelApos} onValueChange={(v) => setStatusImovelApos(v as typeof statusImovelApos)}>
                <SelectTrigger id="status-apos" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                  <SelectItem value="EM_REFORMA">Em reforma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="motivo-saida">Motivo (opcional)</Label>
            <Textarea id="motivo-saida" rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>

          {rescisao && multa && (
            <div className="space-y-1.5 rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dias restantes de contrato</span>
                <span className="tabular-nums">
                  {multa.diasRestantes} de {multa.diasTotais}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-semibold">
                <span>Multa rescisória sugerida</span>
                <span className="tabular-nums">{formatBRL(multa.multa)}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            As cobranças de competências futuras ainda não pagas serão canceladas automaticamente.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmar} disabled={pending}>
            {pending && <Spinner />}
            {rescisao ? "Rescindir contrato" : "Encerrar contrato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
