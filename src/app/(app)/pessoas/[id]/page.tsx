import { MessageCircleIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { FileList } from "@/components/shared/file-list";
import { FileUploader } from "@/components/shared/file-uploader";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { excluirPessoa } from "@/features/pessoas/actions";
import { obterPessoa } from "@/features/pessoas/queries";
import { formatDate } from "@/lib/dates";
import { formatDocumento, formatEndereco, formatPhone, whatsappLink } from "@/lib/format";
import { ESTADO_CIVIL, PAPEL_CONTRATO, PAPEL_PESSOA, STATUS_CONTRATO, TIPO_PESSOA } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { isAdmin, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Pessoa" };

export default async function PessoaDetalhePage(props: PageProps<"/pessoas/[id]">) {
  const { id } = await props.params;
  const [pessoa, user] = await Promise.all([obterPessoa(id), requireUser()]);
  if (!pessoa) notFound();

  const link = whatsappLink(pessoa.telefone1);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {pessoa.nome}
            {pessoa.papeis.map((papel) => (
              <Badge key={papel} variant="secondary">
                {PAPEL_PESSOA[papel]}
              </Badge>
            ))}
          </span>
        }
        description={`${TIPO_PESSOA[pessoa.tipo]} · ${formatDocumento(pessoa.documento)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/pessoas/${pessoa.id}/editar`}>
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
                titulo="Excluir pessoa?"
                descricao="Só é possível excluir pessoas sem contratos vinculados."
                confirmLabel="Excluir"
                action={excluirPessoa.bind(null, pessoa.id)}
              />
            )}
          </>
        }
      />

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({pessoa.arquivos.length})</TabsTrigger>
          <TabsTrigger value="contratos">Contratos ({pessoa.contratos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="flex items-center gap-1.5 text-sm">
                  {formatPhone(pessoa.telefone1) || "—"}
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      aria-label="Abrir no WhatsApp"
                    >
                      <MessageCircleIcon className="size-4" />
                    </a>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="text-sm">{pessoa.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="text-sm">{formatEndereco(pessoa)}</p>
              </div>
              {pessoa.tipo === "PF" ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">RG</p>
                    <p className="text-sm">{pessoa.rg ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estado civil</p>
                    <p className="text-sm">{pessoa.estadoCivil ? ESTADO_CIVIL[pessoa.estadoCivil] : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profissão</p>
                    <p className="text-sm">{pessoa.profissao ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Renda mensal</p>
                    <p className="text-sm">{formatBRL(pessoa.rendaMensal)}</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground">Representante</p>
                  <p className="text-sm">
                    {pessoa.representanteNome} {pessoa.representanteDocumento && `(${formatDocumento(pessoa.representanteDocumento)})`}
                  </p>
                </div>
              )}
              {pessoa.observacoes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Observações</p>
                  <p className="text-sm whitespace-pre-line">{pessoa.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <FileUploader entidade="pessoa" entidadeId={pessoa.id} categoria="DOCUMENTO" titulo="RG, CPF, comprovantes..." />
          <FileList arquivos={pessoa.arquivos} />
        </TabsContent>

        <TabsContent value="contratos" className="space-y-3">
          {pessoa.contratos.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum contrato vinculado.</p>
          ) : (
            pessoa.contratos.map((parte) => {
              const status = STATUS_CONTRATO[parte.contrato.status];
              return (
                <Card key={parte.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium">
                        {parte.contrato.imovel.titulo} ({parte.contrato.imovel.codigo}){" "}
                        <Badge variant="secondary">{status.label}</Badge>
                      </p>
                      <p className="text-muted-foreground">
                        {PAPEL_CONTRATO[parte.papel]} · {formatDate(parte.contrato.dataInicio)} até{" "}
                        {formatDate(parte.contrato.dataFim)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
