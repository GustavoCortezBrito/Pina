"use client";

import { DownloadIcon, FileTextIcon, ImageIcon, Trash2Icon } from "lucide-react";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { Button } from "@/components/ui/button";
import { excluirArquivo } from "@/features/arquivos/actions";
import { formatDateTime } from "@/lib/dates";
import { formatBytes } from "@/lib/format";

export type ArquivoItem = {
  id: string;
  nomeOriginal: string;
  mime: string;
  tamanho: number;
  criadoEm: Date;
};

export function FileList({ arquivos, vazio = "Nenhum arquivo enviado." }: { arquivos: ArquivoItem[]; vazio?: string }) {
  if (arquivos.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{vazio}</p>;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {arquivos.map((arquivo) => {
        const Icon = arquivo.mime.startsWith("image/") ? ImageIcon : FileTextIcon;
        return (
          <li key={arquivo.id} className="flex items-center gap-3 p-3">
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <a
                href={`/api/arquivos/${arquivo.id}`}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-sm font-medium hover:underline"
              >
                {arquivo.nomeOriginal}
              </a>
              <p className="text-xs text-muted-foreground">
                {formatBytes(arquivo.tamanho)} · enviado em {formatDateTime(arquivo.criadoEm)}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" asChild aria-label="Baixar">
              <a href={`/api/arquivos/${arquivo.id}?download=1`}>
                <DownloadIcon />
              </a>
            </Button>
            <ConfirmAction
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="Excluir arquivo">
                  <Trash2Icon />
                </Button>
              }
              titulo="Excluir arquivo?"
              descricao={`"${arquivo.nomeOriginal}" será apagado definitivamente.`}
              confirmLabel="Excluir"
              action={() => excluirArquivo(arquivo.id)}
            />
          </li>
        );
      })}
    </ul>
  );
}
