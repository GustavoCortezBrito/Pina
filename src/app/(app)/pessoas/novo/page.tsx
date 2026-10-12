import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PessoaForm } from "@/features/pessoas/components/pessoa-form";

export const metadata: Metadata = { title: "Nova pessoa" };

export default function NovaPessoaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader voltar={"/pessoas"}
        title="Nova pessoa"
        description="Cadastre um inquilino, fiador ou proprietário."
      />
      <PessoaForm />
    </div>
  );
}
