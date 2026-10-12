import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { EmpreendimentoForm } from "@/features/empreendimentos/components/empreendimento-form";
import { obterEmpreendimento } from "@/features/empreendimentos/queries";

export const metadata: Metadata = { title: "Editar empreendimento" };

export default async function EditarEmpreendimentoPage(
  props: PageProps<"/empreendimentos/[id]/editar">,
) {
  const { id } = await props.params;
  const empreendimento = await obterEmpreendimento(id);
  if (!empreendimento) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader voltar={`/empreendimentos/${id}`} title={`Editar · ${empreendimento.nome}`} />
      <EmpreendimentoForm
        empreendimentoId={empreendimento.id}
        valores={{
          nome: empreendimento.nome,
          cep: empreendimento.cep ?? "",
          logradouro: empreendimento.logradouro ?? "",
          numero: empreendimento.numero ?? "",
          bairro: empreendimento.bairro ?? "",
          cidade: empreendimento.cidade,
          uf: empreendimento.uf,
          observacoes: empreendimento.observacoes ?? "",
        }}
      />
    </div>
  );
}
