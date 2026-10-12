"use client";

import { CheckCircle2Icon, DownloadIcon } from "lucide-react";
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
import { registrarPagamento } from "@/features/financeiro/cobrancas/actions";
import { calcularEncargos } from "@/features/financeiro/services/encargos";
import { parseISODate, toISODate, today } from "@/lib/dates";
import { FORMA_PAGAMENTO, options } from "@/lib/labels";
import { formatBRL } from "@/lib/money";

export function ReceberDialog({
  cobrancaId,
  saldo,
  vencimento,
  percMulta,
  percJurosMes,
  trigger,
}: {
  cobrancaId: string;
  saldo: number;
  vencimento: Date;
  percMulta: number;
  percJurosMes: number;
  trigger: React.ReactNode;
}) {
  const { pending, run } = useAction();
  const [aberto, setAberto] = React.useState(false);
  const [dataPagamento, setDataPagamento] = React.useState(toISODate(today()));
  const [forma, setForma] = React.useState("PIX");
  const [concluido, setConcluido] = React.useState(false);

  const encargos = React.useMemo(() => {
    const data = parseISODate(dataPagamento) ?? today();
    return calcularEncargos({ saldo, vencimento, dataPagamento: data, percMulta, percJurosMes });
  }, [dataPagamento, saldo, vencimento, percMulta, percJurosMes]);

  const total = saldo + encargos.multa + encargos.juros;

  function fechar(open: boolean) {
    setAberto(open);
    if (!open) setTimeout(() => setConcluido(false), 200);
  }

  async function confirmar() {
    await run(() => registrarPagamento({ cobrancaId, dataPagamento, forma }), {
      onSuccess: () => setConcluido(true),
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        {concluido ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2Icon className="size-5 text-success" />
                Pagamento registrado
              </DialogTitle>
              <DialogDescription>O recibo já pode ser baixado ou enviado ao inquilino.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => fechar(false)}>
                Fechar
              </Button>
              <Button asChild>
                <a href={`/api/pdf/recibo/${cobrancaId}?download=1`} target="_blank" rel="noreferrer">
                  <DownloadIcon /> Baixar recibo
                </a>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Receber cobrança</DialogTitle>
              <DialogDescription>
                {encargos.diasAtraso > 0
                  ? `${encargos.diasAtraso} dias de atraso — multa e juros calculados automaticamente.`
                  : "Pagamento em dia, sem encargos."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="data-pagamento">Data do pagamento</Label>
                  <Input
                    id="data-pagamento"
                    type="date"
                    value={dataPagamento}
                    onChange={(event) => setDataPagamento(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="forma-pagamento">Forma</Label>
                  <Select value={forma} onValueChange={setForma}>
                    <SelectTrigger id="forma-pagamento" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options(FORMA_PAGAMENTO).map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg border p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor original</span>
                  <span className="tabular-nums">{formatBRL(saldo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Multa</span>
                  <span className="tabular-nums">{formatBRL(encargos.multa)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Juros</span>
                  <span className="tabular-nums">{formatBRL(encargos.juros)}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 font-semibold">
                  <span>Total a receber</span>
                  <span className="tabular-nums">{formatBRL(total)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => fechar(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmar} disabled={pending}>
                {pending && <Spinner />}
                Confirmar recebimento
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
