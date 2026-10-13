"use client";

import { DownloadIcon, EyeIcon, ExternalLinkIcon, FileSignatureIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PapelContrato } from "./papel-contrato";

type Documento = { titulo: string; locadorNome: string; conteudo: string; modeloNome: string };

/** Botão "Visualizar" que abre o contrato em uma janela, como ele sai no PDF. */
export function ContratoPreviewDialog({
  contratoId,
  rotulo = "Visualizar",
  variant = "outline",
  size = "sm",
  className,
  mostrarAbrir = true,
}: {
  contratoId: string;
  rotulo?: string;
  variant?: "outline" | "default" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  /** Mostra o botão para abrir a página completa do contrato. */
  mostrarAbrir?: boolean;
}) {
  const [aberto, setAberto] = React.useState(false);
  const [doc, setDoc] = React.useState<Documento | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!aberto || doc) return;
    let cancelado = false;
    fetch(`/api/contratos/${contratoId}/preview`)
      .then(async (r) => {
        const dados = await r.json();
        if (!r.ok) throw new Error(dados.error ?? "Não foi possível carregar o contrato.");
        if (!cancelado) {
          setErro(null);
          setDoc(dados as Documento);
        }
      })
      .catch((e: Error) => !cancelado && setErro(e.message));
    return () => {
      cancelado = true;
    };
  }, [aberto, doc, contratoId]);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button type="button" variant={variant} size={size} className={className}>
          <EyeIcon /> {rotulo}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[92vh] max-w-4xl! flex-col gap-3 overflow-hidden p-0">
        <DialogHeader className="space-y-1 px-5 pt-5 text-left">
          <DialogTitle className="flex items-center gap-2">
            <FileSignatureIcon className="size-5 text-primary-ink" /> {doc?.titulo ?? "Contrato"}
          </DialogTitle>
          <DialogDescription>
            Visualização do contrato como será impresso{doc ? ` · ${doc.modeloNome}` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/60 px-3 py-4 sm:px-6">
          {erro ? (
            <p className="rounded-lg bg-danger/10 p-4 text-center text-sm font-medium text-danger">{erro}</p>
          ) : !doc ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <Loader2Icon className="mr-2 size-5 animate-spin" /> Carregando contrato...
            </div>
          ) : (
            <PapelContrato titulo={doc.titulo} locadorNome={doc.locadorNome} conteudo={doc.conteudo} />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3">
          {mostrarAbrir && (
            <Button variant="ghost" asChild>
              <Link href={`/contratos/${contratoId}`}>
                <ExternalLinkIcon /> Abrir página do contrato
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={`/api/pdf/contrato/${contratoId}?download=1`}>
              <DownloadIcon /> Baixar PDF
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
