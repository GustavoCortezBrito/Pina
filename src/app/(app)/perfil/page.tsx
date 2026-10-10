import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PerfilForm } from "@/features/perfil/components/perfil-form";
import { isAdmin, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Meu perfil" description="Seus dados e sua senha de acesso." />
      <PerfilForm nome={user.name} email={user.email} perfil={isAdmin(user) ? "Administrador" : "Operador"} />
    </div>
  );
}
