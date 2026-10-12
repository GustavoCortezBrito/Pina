import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { FotoPerfilEditor } from "@/components/shared/foto-perfil";
import { db } from "@/lib/db";
import { PerfilForm } from "@/features/perfil/components/perfil-form";
import { isAdmin, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const user = await requireUser();
  const foto = await db.arquivo.findFirst({
    where: { usuarioId: user.id, categoria: "FOTO_PERFIL" },
    select: { id: true },
  });
  const fotoId = foto?.id ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Meu perfil" description="Seus dados e sua senha de acesso." />
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
        <FotoPerfilEditor tipo="usuario" id={user.id} nome={user.name} arquivoId={fotoId} />
        <p className="text-sm text-muted-foreground">
          Sua foto aparece no menu e no histórico. Toque na câmera para trocar.
        </p>
      </div>
      <PerfilForm nome={user.name} email={user.email} perfil={isAdmin(user) ? "Administrador" : "Operador"} />
    </div>
  );
}
