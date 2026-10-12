"use client";

import { CameraIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Foto redonda, ou as iniciais quando ainda não há foto. */
export function AvatarFoto({
  nome,
  arquivoId,
  src,
  className,
  fallbackClassName,
}: {
  nome: string;
  arquivoId?: string | null;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const url = arquivoId ? `/api/arquivos/${arquivoId}?thumb=1` : src;
  return (
    <Avatar className={className}>
      {url && <AvatarImage src={url} alt={nome} />}
      <AvatarFallback
        className={cn("bg-primary font-bold text-primary-foreground", fallbackClassName)}
      >
        {initials(nome)}
      </AvatarFallback>
    </Avatar>
  );
}

/** Foto grande com botão de câmera para trocar e opção de remover. */
export function FotoPerfilEditor({
  tipo,
  id,
  nome,
  arquivoId,
  className,
}: {
  tipo: "pessoa" | "usuario";
  id: string;
  nome: string;
  arquivoId?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = React.useState(false);
  const [versao, setVersao] = React.useState(0);

  async function enviar(file: File | undefined) {
    if (!file) return;
    setEnviando(true);
    const form = new FormData();
    form.set("tipo", tipo);
    form.set("id", id);
    form.set("arquivo", file);
    try {
      const resposta = await fetch("/api/foto-perfil", { method: "POST", body: form });
      const dados = (await resposta.json()) as { ok: boolean; error?: string };
      if (!resposta.ok || !dados.ok) return void toast.error(dados.error ?? "Não foi possível enviar a foto.");
      toast.success("Foto atualizada.");
      setVersao((v) => v + 1);
      router.refresh();
    } catch {
      toast.error("Falha de conexão ao enviar a foto.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remover() {
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/foto-perfil?tipo=${tipo}&id=${id}`, { method: "DELETE" });
      if (!resposta.ok) return void toast.error("Não foi possível remover a foto.");
      toast.success("Foto removida.");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={cn("relative size-24 shrink-0", className)}>
      <AvatarFoto
        key={`${arquivoId}-${versao}`}
        nome={nome}
        arquivoId={arquivoId}
        className="size-24 ring-4 ring-card shadow-lg"
        fallbackClassName="text-2xl"
      />
      {enviando && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white">
          <Spinner />
        </span>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
        aria-label={arquivoId ? "Trocar foto" : "Adicionar foto"}
        title={arquivoId ? "Trocar foto" : "Adicionar foto"}
        className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-card transition-transform hover:scale-110 active:scale-95"
      >
        <CameraIcon className="size-4.5" />
      </button>
      {arquivoId && !enviando && (
        <button
          type="button"
          onClick={remover}
          aria-label="Remover foto"
          title="Remover foto"
          className="absolute bottom-0 left-0 flex size-7 items-center justify-center rounded-full bg-card text-danger shadow-md ring-1 ring-border transition-transform hover:scale-110"
        >
          <Trash2Icon className="size-3.5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => enviar(e.target.files?.[0])}
      />
    </div>
  );
}
