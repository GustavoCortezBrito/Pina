"use client";

import { UploadCloudIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Props = {
  entidade: "imovel" | "pessoa" | "contrato" | "pagamento" | "despesa" | "manutencao" | "vistoria";
  entidadeId: string;
  categoria: "FOTO" | "DOCUMENTO" | "CONTRATO_ASSINADO" | "COMPROVANTE" | "VISTORIA" | "OUTRO";
  accept?: string;
  titulo?: string;
  descricao?: string;
  className?: string;
};

export function FileUploader({
  entidade,
  entidadeId,
  categoria,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  titulo = "Arraste os arquivos ou clique para escolher",
  descricao = "JPG, PNG, WebP ou PDF",
  className,
}: Props) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = React.useState(false);
  const [arrastando, setArrastando] = React.useState(false);

  async function enviar(files: FileList | null) {
    if (!files?.length || enviando) return;
    setEnviando(true);
    const form = new FormData();
    form.set("entidade", entidade);
    form.set("entidadeId", entidadeId);
    form.set("categoria", categoria);
    for (const file of Array.from(files)) form.append("arquivos", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await response.json()) as { ok: boolean; error?: string; arquivos?: unknown[] };
      if (!response.ok || !data.ok) {
        toast.error(data.error ?? "Não foi possível enviar os arquivos.");
        return;
      }
      toast.success(
        data.arquivos?.length === 1 ? "1 arquivo enviado." : `${data.arquivos?.length} arquivos enviados.`,
      );
      router.refresh();
    } catch {
      toast.error("Falha de conexão ao enviar os arquivos.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(event) => {
        event.preventDefault();
        setArrastando(false);
        void enviar(event.dataTransfer.files);
      }}
      className={cn(
        "rounded-lg border border-dashed transition-colors",
        arrastando ? "border-primary bg-primary/5" : "border-border",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
        className="flex w-full flex-col items-center gap-1 px-4 py-6 text-center text-sm disabled:opacity-60"
      >
        {enviando ? <Spinner className="size-5" /> : <UploadCloudIcon className="size-5 text-muted-foreground" />}
        <span className="font-medium">{enviando ? "Enviando..." : titulo}</span>
        <span className="text-xs text-muted-foreground">{descricao}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        onChange={(event) => void enviar(event.target.files)}
      />
    </div>
  );
}
