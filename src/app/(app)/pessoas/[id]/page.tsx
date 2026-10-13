import {
  ExternalLinkIcon,
  FileSignatureIcon,
  HandCoinsIcon,
  MessageCircleIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { FileList } from "@/components/shared/file-list";
import { FileUploader } from "@/components/shared/file-uploader";
import { FotoPerfilEditor } from "@/components/shared/foto-perfil";
import { ImovelLink } from "@/components/shared/imovel-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContratoPreviewDialog } from "@/features/contratos/components/contrato-preview-dialog";
import { excluirPessoa } from "@/features/pessoas/actions";
import { obterPessoa } from "@/features/pessoas/queries";
import { formatDate } from "@/lib/dates";
import { formatDocumento, formatEndereco, formatNumeroContrato, formatPhone, whatsappLink } from "@/lib/format";
import {
  ESTADO_CIVIL,
  PAPEL_CONTRATO,
  PAPEL_PESSOA,
  STATUS_CONTRATO,
  TIPO_PESSOA,
} from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { TONE_CARD, TONE_ICON } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { isAdmin, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Pessoa" };

export default async function PessoaDetalhePage(props: PageProps<"/pessoas/[id]">) {
  const { id } = await props.params;
  const [pessoa, user] = await Promise.all([obterPessoa(id), requireUser()]);
  if (!pessoa) notFound();

  const link = whatsappLink(pessoa.telefone1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
        <FotoPerfilEditor tipo="pessoa" id={pessoa.id} nome={pessoa.nome} arquivoId={pessoa.fotoPerfilId} />
        <p className="text-sm text-muted-foreground">Foto de perfil — toque na câmera para adicionar ou trocar.</p>
      </div>

      <PageHeader voltar={"/pessoas"}
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
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="flex items-center gap-1.5 text-sm">
                  {formatPhone(pessoa.telefone1) || "—"}
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-success hover:text-success/80"
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
                    <p className="text-sm">
                      {pessoa.estadoCivil ? ESTADO_CIVIL[pessoa.estadoCivil] : "—"}
                    </p>
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
                    {pessoa.representanteNome}{" "}
                    {pessoa.representanteDocumento &&
                      `(${formatDocumento(pessoa.representanteDocumento)})`}
                  </p>
                </div>
              )}
              {pessoa.observacoes && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Observações</p>
                  <p className="text-sm whitespace-pre-line">{pessoa.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <FileUploader
            entidade="pessoa"
            entidadeId={pessoa.id}
            categoria="DOCUMENTO"
            titulo="RG, CPF, comprovantes..."
          />
          <FileList arquivos={pessoa.arquivos} />
        </TabsContent>

        <TabsContent value="contratos" className="space-y-3">
          {pessoa.contratos.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum contrato vinculado.
            </p>
          ) : (
            pessoa.contratos.map((parte) => {
              const status = STATUS_CONTRATO[parte.contrato.status];
              const numero = formatNumeroContrato(parte.contrato.numero);
              return (
                <Card
                  key={parte.id}
                  className={cn("animate-fade-up gap-3 p-4 sm:p-5", TONE_CARD[status.tone])}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", TONE_ICON[status.tone])}>
                        <FileSignatureIcon className="size-5" />
                      </span>
                      <div>
                        <p className="font-bold">
                          Contrato nº {numero} <StatusBadge label={status.label} tone={status.tone} className="ml-1" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <ImovelLink id={parte.contrato.imovel.id} className="font-medium text-foreground">
                            {parte.contrato.imovel.titulo} ({parte.contrato.imovel.codigo})
                          </ImovelLink>
                        </p>
                      </div>
                    </div>
                    <p className="text-right text-lg font-bold text-primary-ink tabular-nums">
                      {formatBRL(parte.contrato.valorAluguel)}
                      <span className="block text-xs font-medium text-muted-foreground">por mês</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{PAPEL_CONTRATO[parte.papel]}</strong> · {formatDate(parte.contrato.dataInicio)}{" "}
                    até {formatDate(parte.contrato.dataFim)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <ContratoPreviewDialog contratoId={parte.contrato.id} rotulo="Visualizar contrato" variant="default" />
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/contratos/${parte.contrato.id}`}>
                        <ExternalLinkIcon /> Abrir contrato
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/financeiro/cobrancas/${parte.contrato.id}`}>
                        <HandCoinsIcon /> Cobranças
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
