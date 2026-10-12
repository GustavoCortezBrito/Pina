"use client";

import { AlertCircleIcon, CheckCircle2Icon, DownloadIcon, FileSpreadsheetIcon, UploadIcon } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { importarDespesas, type ResultadoImportacao } from "../importar";

export function ImportarDespesasDialog() {
  const { pending, run } = useAction();
  const [aberto, setAberto] = React.useState(false);
  const [arquivo, setArquivo] = React.useState<File | null>(null);
  const [resultado, setResultado] = React.useState<ResultadoImportacao | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function fechar(open: boolean) {
    setAberto(open);
    if (!open) {
      setArquivo(null);
      setResultado(null);
    }
  }

  async function enviar() {
    if (!arquivo) return;
    const form = new FormData();
    form.set("arquivo", arquivo);
    const resposta = await run(() => importarDespesas(form), {
      onSuccess: (r) => setResultado(r),
    });
    if (resposta.ok && resposta.data.criadas > 0) setArquivo(null);
  }

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          <UploadIcon /> Importar planilha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg!">
        <DialogHeader>
          <DialogTitle>Importar despesas do Excel</DialogTitle>
          <DialogDescription>
            Baixe o modelo, preencha uma despesa por linha e envie de volta. Se alguma linha tiver erro, nada é
            importado e mostramos o que corrigir.
          </DialogDescription>
        </DialogHeader>

        <Button variant="outline" asChild className="w-full justify-start">
          <a href="/api/despesas/modelo">
            <DownloadIcon /> Baixar modelo (.xlsx)
          </a>
        </Button>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/5"
        >
          <FileSpreadsheetIcon className="size-8 text-success" />
          <span className="font-medium">{arquivo ? arquivo.name : "Escolher planilha preenchida"}</span>
          <span className="text-sm text-muted-foreground">Excel (.xlsx), até 500 linhas</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={(e) => {
            setArquivo(e.target.files?.[0] ?? null);
            setResultado(null);
          }}
        />

        {resultado && resultado.criadas > 0 && (
          <p className="flex items-center gap-2 rounded-lg bg-success/12 p-3 text-sm font-medium text-success">
            <CheckCircle2Icon className="size-4" /> {resultado.criadas} despesa(s) importada(s) com sucesso.
          </p>
        )}
        {resultado && resultado.erros.length > 0 && (
          <div className="space-y-2 rounded-lg bg-danger/10 p-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-danger">
              <AlertCircleIcon className="size-4" /> Nada foi importado. Corrija estas linhas:
            </p>
            <ul className="max-h-40 space-y-1 overflow-auto">
              {resultado.erros.map((erro) => (
                <li key={erro.linha}>
                  <span className="font-semibold">Linha {erro.linha}:</span> {erro.mensagem}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => fechar(false)}>
            Fechar
          </Button>
          <Button disabled={!arquivo || pending} onClick={enviar}>
            {pending ? <Spinner /> : <UploadIcon />} Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
