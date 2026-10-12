import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { opcoesEmpreendimentos } from "@/features/empreendimentos/queries";
import { ImovelForm } from "@/features/imoveis/components/imovel-form";
import { obterImovel } from "@/features/imoveis/queries";
import type { ImovelInput } from "@/features/imoveis/schemas";
import { opcoesPessoas } from "@/features/pessoas/queries";

export const metadata: Metadata = { title: "Editar imóvel" };

export default async function EditarImovelPage(props: PageProps<"/imoveis/[id]/editar">) {
  const { id } = await props.params;
  const [imovel, empreendimentos, proprietarios] = await Promise.all([
    obterImovel(id),
    opcoesEmpreendimentos(),
    opcoesPessoas("PROPRIETARIO"),
  ]);

  if (!imovel) notFound();

  const valores: ImovelInput = {
    codigo: imovel.codigo,
    titulo: imovel.titulo,
    tipo: imovel.tipo,
    status: imovel.status,
    empreendimentoId: imovel.empreendimentoId,
    proprietarioId: imovel.proprietarioId,
    descricao: imovel.descricao ?? "",
    cep: imovel.cep ?? "",
    logradouro: imovel.logradouro ?? "",
    numero: imovel.numero ?? "",
    complemento: imovel.complemento ?? "",
    bairro: imovel.bairro ?? "",
    cidade: imovel.cidade,
    uf: imovel.uf,
    quartos: imovel.quartos,
    suites: imovel.suites,
    banheiros: imovel.banheiros,
    vagas: imovel.vagas,
    areaM2: imovel.areaM2,
    mobilia: imovel.mobilia,
    aceitaPet: imovel.aceitaPet,
    caracteristicas: imovel.caracteristicas,
    valorAluguel: imovel.valorAluguel,
    valorCondominio: imovel.valorCondominio,
    valorIptuAnual: imovel.valorIptuAnual,
    matricula: imovel.matricula ?? "",
    inscricaoIptu: imovel.inscricaoIptu ?? "",
    instalacaoAgua: imovel.instalacaoAgua ?? "",
    instalacaoEnergia: imovel.instalacaoEnergia ?? "",
    observacoes: imovel.observacoes ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader voltar={`/imoveis/${id}`} title={`Editar · ${imovel.codigo}`} description={imovel.titulo} />
      <ImovelForm
        imovelId={imovel.id}
        valores={valores}
        empreendimentos={empreendimentos}
        proprietarios={proprietarios}
      />
    </div>
  );
}
