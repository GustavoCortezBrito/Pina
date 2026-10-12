"use client";

import { GlobeIcon } from "lucide-react";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import { alterarPublicacaoImovel } from "../actions";

export function PublicarSiteButton({ id, publicado }: { id: string; publicado: boolean }) {
  const { pending, run } = useAction();

  return (
    <Button
      variant={publicado ? "default" : "outline"}
      disabled={pending}
      onClick={() => run(() => alterarPublicacaoImovel(id, !publicado))}
    >
      <GlobeIcon /> {publicado ? "Publicado no site" : "Publicar no site"}
    </Button>
  );
}
