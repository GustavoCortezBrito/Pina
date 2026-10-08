import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { FotoCapa } from "@/components/shared/photo-gallery";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { excluirEmpreendimento } from "@/features/empreendimentos/actions";
import { obterEmpreendimento } from "@/features/empreendimentos/queries";
import { formatEndereco } from "@/lib/format";
import { STATUS_IMOVEL, TIPO_IMOVEL } from "@/lib/labels";
import { isAdmin, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Empreendimento" };

export default async function EmpreendimentoDetalhePage(props: PageProps<"/empreendimentos/[id]">) {
  const { id } = await props.params;
  const [empreendimento, user] = await Promise.all([obterEmpreendimento(id), requireUser()]);
  if (!empreendimento) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={empreendimento.nome}
        description={formatEndereco(empreendimento)}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/empreendimentos/${empreendimento.id}/editar`}>
                <PencilIcon /> Editar
              </Link>
            </Button>
            {isAdmin(user) && (
              <ConfirmAction
                trigger={
                  <Button variant="outline">
                    <Trash2Icon /> Excluir
                  </Button>
                }
                titulo="Excluir empreendimento?"
                descricao="Só é possível excluir empreendimentos sem imóveis vinculados."
                confirmLabel="Excluir"
                action={excluirEmpreendimento.bind(null, empreendimento.id)}
              />
            )}
          </>
        }
      />

      {empreendimento.observacoes && (
        <p className="text-sm text-muted-foreground">{empreendimento.observacoes}</p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Unidades</h2>
        <Button size="sm" asChild>
          <Link href={`/imoveis/novo?empreendimento=${empreendimento.id}`}>
            <PlusIcon /> Nova unidade
          </Link>
        </Button>
      </div>

      {empreendimento.imoveis.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PlusIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma unidade cadastrada</EmptyTitle>
            <EmptyDescription>Cadastre o primeiro imóvel deste empreendimento.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {empreendimento.imoveis.map((imovel, index) => {
            const status = STATUS_IMOVEL[imovel.status];
            const locatario = imovel.contratos[0]?.partes[0]?.pessoa.nome;
            return (
              <Link
                key={imovel.id}
                href={`/imoveis/${imovel.id}`}
                className="animate-in fade-in slide-in-from-bottom-2 block rounded-xl duration-500 fill-mode-both"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <Card className="group h-full gap-0 overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <FotoCapa
                      arquivoId={imovel.arquivos[0]?.id}
                      alt={imovel.titulo}
                      className="size-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <StatusBadge label={status.label} tone={status.tone} className="absolute top-2 right-2" />
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-semibold">{imovel.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {imovel.codigo} · {TIPO_IMOVEL[imovel.tipo]}
                    </p>
                    {locatario && <p className="truncate text-xs text-muted-foreground">{locatario}</p>}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
