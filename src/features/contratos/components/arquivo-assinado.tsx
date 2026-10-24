import { DownloadIcon, ExternalLinkIcon, FileQuestionIcon, FileTextIcon } from "lucide-react";
import { FileUploader } from "@/components/shared/file-uploader";
import { Button } from "@/components/ui/button";

export type ArquivoAssinado = { id: string; mime: string; nomeOriginal: string };

/** Mostra o contrato assinado que foi anexado (PDF ou imagem) ou pede para anexar. */
export function ArquivoAssinadoView({
  contratoId,
  arquivo,
  altura = "h-[75vh]",
}: {
  contratoId: string;
  arquivo: ArquivoAssinado | null;
  altura?: string;
}) {
  if (!arquivo) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 p-5">
          <FileQuestionIcon className="mt-0.5 size-6 shrink-0 text-primary-ink" />
          <div>
            <p className="font-semibold">Este contrato ainda não tem o arquivo assinado</p>
            <p className="text-sm text-muted-foreground">
              Anexe o PDF ou a foto do contrato assinado para guardar e consultar aqui.
            </p>
          </div>
        </div>
        <FileUploader
          entidade="contrato"
          entidadeId={contratoId}
          categoria="CONTRATO_ASSINADO"
          accept="application/pdf,.doc,.docx,.odt,image/jpeg,image/png"
          titulo="Enviar o contrato assinado"
          descricao="PDF, foto ou documento"
        />
      </div>
    );
  }

  const url = `/api/arquivos/${arquivo.id}`;
  const ehPdf = arquivo.mime === "application/pdf";
  const ehImagem = arquivo.mime.startsWith("image/");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileTextIcon className="size-4" /> {arquivo.nomeOriginal}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLinkIcon /> Abrir em outra aba
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`${url}?download=1`}>
              <DownloadIcon /> Baixar
            </a>
          </Button>
        </div>
      </div>
      {ehPdf ? (
        <iframe title="Contrato assinado" src={url} className={`${altura} w-full rounded-xl border bg-white`} />
      ) : ehImagem ? (
        <div className="rounded-xl bg-muted/60 p-3">
          <img src={url} alt="Contrato assinado" className="mx-auto max-h-[75vh] rounded-lg shadow" />
        </div>
      ) : (
        <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
          Este tipo de arquivo não abre na tela. Use &quot;Baixar&quot; para ver o contrato.
        </p>
      )}
    </div>
  );
}
