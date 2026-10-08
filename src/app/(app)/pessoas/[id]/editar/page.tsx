import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PessoaForm } from "@/features/pessoas/components/pessoa-form";
import { obterPessoa } from "@/features/pessoas/queries";
import type { PessoaInput } from "@/features/pessoas/schemas";
import { toISODate } from "@/lib/dates";

export const metadata: Metadata = { title: "Editar pessoa" };

export default async function EditarPessoaPage(props: PageProps<"/pessoas/[id]/editar">) {
  const { id } = await props.params;
  const pessoa = await obterPessoa(id);
  if (!pessoa) notFound();

  const valores: PessoaInput = {
    tipo: pessoa.tipo,
    papeis: pessoa.papeis,
    nome: pessoa.nome,
    nomeFantasia: pessoa.nomeFantasia ?? "",
    documento: pessoa.documento,
    rg: pessoa.rg ?? "",
    orgaoEmissor: pessoa.orgaoEmissor ?? "",
    dataNascimento: pessoa.dataNascimento ? toISODate(pessoa.dataNascimento) : "",
    estadoCivil: pessoa.estadoCivil ?? "",
    profissao: pessoa.profissao ?? "",
    rendaMensal: pessoa.rendaMensal,
    email: pessoa.email ?? "",
    telefone1: pessoa.telefone1 ?? "",
    telefone1Whats: pessoa.telefone1Whats,
    telefone2: pessoa.telefone2 ?? "",
    cep: pessoa.cep ?? "",
    logradouro: pessoa.logradouro ?? "",
    numero: pessoa.numero ?? "",
    complemento: pessoa.complemento ?? "",
    bairro: pessoa.bairro ?? "",
    cidade: pessoa.cidade ?? "",
    uf: pessoa.uf ?? "",
    conjugeNome: pessoa.conjugeNome ?? "",
    conjugeDocumento: pessoa.conjugeDocumento ?? "",
    representanteNome: pessoa.representanteNome ?? "",
    representanteDocumento: pessoa.representanteDocumento ?? "",
    observacoes: pessoa.observacoes ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={`Editar · ${pessoa.nome}`} />
      <PessoaForm pessoaId={pessoa.id} valores={valores} />
    </div>
  );
}
