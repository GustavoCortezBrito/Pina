"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import * as React from "react";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  atualizarLegenda,
  definirCapa,
  excluirArquivo,
  moverArquivo,
} from "@/features/arquivos/actions";
import { cn } from "@/lib/utils";

export type Foto = {
  id: string;
  legenda: string | null;
  capa: boolean;
  nomeOriginal: string;
};

export function PhotoGallery({ fotos }: { fotos: Foto[] }) {
  const { pending, run } = useAction();
  const [aberta, setAberta] = React.useState<number | null>(null);
  const [editando, setEditando] = React.useState<Foto | null>(null);
  const [legenda, setLegenda] = React.useState("");

  if (fotos.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon />
          </EmptyMedia>
          <EmptyTitle>Nenhuma foto ainda</EmptyTitle>
          <EmptyDescription>Envie as fotos do imóvel para montar a galeria.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const atual = aberta != null ? fotos[aberta] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fotos.map((foto, index) => (
          <li key={foto.id} className="group relative overflow-hidden rounded-lg border bg-muted">
            <button
              type="button"
              onClick={() => setAberta(index)}
              className="block aspect-4/3 w-full"
              aria-label={`Abrir foto ${index + 1}`}
            >
              <img
                src={`/api/arquivos/${foto.id}?thumb=1`}
                alt={foto.legenda ?? `Foto ${index + 1}`}
                loading="lazy"
                className="size-full object-cover transition-transform group-hover:scale-105"
              />
            </button>

            {foto.capa && (
              <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Capa
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <div className="flex gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-white hover:bg-white/20 hover:text-white"
                  disabled={pending || index === 0}
                  aria-label="Mover para trás"
                  onClick={() => run(() => moverArquivo(foto.id, "anterior"))}
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-white hover:bg-white/20 hover:text-white"
                  disabled={pending || index === fotos.length - 1}
                  aria-label="Mover para frente"
                  onClick={() => run(() => moverArquivo(foto.id, "proximo"))}
                >
                  <ChevronRightIcon />
                </Button>
              </div>
              <div className="flex gap-0.5">
                {!foto.capa && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-white hover:bg-white/20 hover:text-white"
                    disabled={pending}
                    aria-label="Definir como capa"
                    onClick={() => run(() => definirCapa(foto.id))}
                  >
                    <StarIcon />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-white hover:bg-white/20 hover:text-white"
                  aria-label="Editar legenda"
                  onClick={() => {
                    setEditando(foto);
                    setLegenda(foto.legenda ?? "");
                  }}
                >
                  <PencilIcon />
                </Button>
                <ConfirmAction
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-white hover:bg-white/20 hover:text-white"
                      aria-label="Excluir foto"
                    >
                      <Trash2Icon />
                    </Button>
                  }
                  titulo="Excluir foto?"
                  descricao="A foto será apagada definitivamente do sistema."
                  confirmLabel="Excluir"
                  action={() => excluirArquivo(foto.id)}
                />
              </div>
            </div>

            {foto.legenda && (
              <p className="truncate bg-background/90 px-2 py-1 text-xs text-muted-foreground">
                {foto.legenda}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Visualização em tela cheia */}
      <Dialog open={atual != null} onOpenChange={(open) => !open && setAberta(null)}>
        <DialogContent className="max-w-4xl!" showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>{atual?.legenda ?? atual?.nomeOriginal ?? "Foto"}</DialogTitle>
            <DialogDescription>Visualização da foto do imóvel</DialogDescription>
          </DialogHeader>
          {atual && (
            <div className="space-y-3">
              <img
                src={`/api/arquivos/${atual.id}`}
                alt={atual.legenda ?? atual.nomeOriginal}
                className="max-h-[70vh] w-full rounded-md object-contain"
              />
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={aberta === 0}
                  onClick={() => setAberta((i) => Math.max(0, (i ?? 0) - 1))}
                >
                  <ChevronLeftIcon /> Anterior
                </Button>
                <p className="truncate text-sm text-muted-foreground">
                  {atual.legenda ?? atual.nomeOriginal} · {(aberta ?? 0) + 1} de {fotos.length}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={aberta === fotos.length - 1}
                  onClick={() => setAberta((i) => Math.min(fotos.length - 1, (i ?? 0) + 1))}
                >
                  Próxima <ChevronRightIcon />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legenda */}
      <Dialog open={editando != null} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legenda da foto</DialogTitle>
            <DialogDescription>
              Ajuda a identificar o cômodo (ex.: &quot;Cozinha&quot;).
            </DialogDescription>
          </DialogHeader>
          <Input
            value={legenda}
            maxLength={200}
            onChange={(event) => setLegenda(event.target.value)}
            placeholder="Sala, cozinha, fachada..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button
              disabled={pending}
              onClick={async () => {
                if (!editando) return;
                const result = await run(() => atualizarLegenda(editando.id, legenda));
                if (result.ok) setEditando(null);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FotoCapa({
  arquivoId,
  alt,
  className,
}: {
  arquivoId?: string | null;
  alt: string;
  className?: string;
}) {
  if (!arquivoId) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
      >
        <ImageIcon className="size-6" />
      </div>
    );
  }
  return (
    <img
      src={`/api/arquivos/${arquivoId}?thumb=1`}
      alt={alt}
      loading="lazy"
      className={cn("object-cover", className)}
    />
  );
}
