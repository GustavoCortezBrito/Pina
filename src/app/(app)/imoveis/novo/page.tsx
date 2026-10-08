import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { opcoesEmpreendimentos } from "@/features/empreendimentos/queries";
import { ImovelForm } from "@/features/imoveis/components/imovel-form";
import { opcoesPessoas } from "@/features/pessoas/queries";

export const metadata: Metadata = { title: "Novo imóvel" };

export default async function NovoImovelPage() {
  const [empreendimentos, proprietarios] = await Promise.all([
    opcoesEmpreendimentos(),
    opcoesPessoas("PROPRIETARIO"),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Novo imóvel" description="Preencha os dados do imóvel." />
      <ImovelForm empreendimentos={empreendimentos} proprietarios={proprietarios} />
    </div>
  );
}
