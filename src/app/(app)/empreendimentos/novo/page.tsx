import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EmpreendimentoForm } from "@/features/empreendimentos/components/empreendimento-form";

export const metadata: Metadata = { title: "Novo empreendimento" };

export default function NovoEmpreendimentoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader voltar={"/empreendimentos"} title="Novo empreendimento" />
      <EmpreendimentoForm />
    </div>
  );
}
