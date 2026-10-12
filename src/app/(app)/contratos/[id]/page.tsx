import {
  BanknoteIcon,
  CalendarClockIcon,
  CalendarRangeIcon,
  FileTextIcon,
  HandCoinsIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileList } from "@/components/shared/file-list";
import { FileUploader } from "@/components/shared/file-uploader";
import { ImovelLink } from "@/components/shared/imovel-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EncerrarDialog } from "@/features/contratos/components/encerrar-dialog";
import { ReajusteDialog } from "@/features/contratos/components/reajuste-dialog";
import { obterContrato } from "@/features/contratos/queries";
import { statusEfetivo } from "@/features/financeiro/services/encargos";
import { formatDate, formatMonth } from "@/lib/dates";
import { formatNumeroContrato } from "@/lib/format";
import {
  FINALIDADE,
  INDICE_REAJUSTE,
  PAPEL_CONTRATO,
  STATUS_COBRANCA,
  STATUS_CONTRATO,
  TIPO_GARANTIA,
  TIPO_VISTORIA,
} from "@/lib/labels";
import { formatBRL, sum } from "@/lib/money";
import { today } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Contrato" };

export default async function ContratoDetalhePage(props: PageProps<"/contratos/[id]">) {
  const { id } = await props.params;
  const contrato = await obterContrato(id);
  if (!contrato) notFound();

  const status = STATUS_CONTRATO[contrato.status];
  const hoje = today();
  // Modelo "por arquivo" (sem conteúdo em texto): baixa o arquivo enviado em vez de gerar o PDF.
  const arquivoDoModelo = contrato.modelo?.conteudo == null ? contrato.modelo?.arquivos[0] : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            Contrato nº {formatNumeroContrato(contrato.numero)}
            <StatusBadge label={status.label} tone={status.tone} />
          </span>
        }
        description={
          <>
            <ImovelLink id={contrato.imovel.id} className="font-medium text-foreground">
              {contrato.imovel.titulo} ({contrato.imovel.codigo})
            </ImovelLink>{" "}
            · {FINALIDADE[contrato.finalidade]}
          </>
        }
        actions={
          <>
            {contrato.status === "ATIVO" && (
              <>
                <ReajusteDialog
                  contratoId={contrato.id}
                  valorAtual={contrato.valorAluguel}
                  indiceReajuste={contrato.indiceReajuste}
                  dataInicio={contrato.dataInicio}
                  dataFim={contrato.dataFim}
                  reajustesAplicados={contrato.reajustes.length}
                />
                <EncerrarDialog
                  contratoId={contrato.id}
                  valorAluguel={contrato.valorAluguel}
                  multaRescisoriaMeses={contrato.multaRescisoriaMeses}
                  dataInicio={contrato.dataInicio}
                  dataFim={contrato.dataFim}
                />
              </>
            )}
            <Button variant="outline" asChild>
              {arquivoDoModelo ? (
                <a href={`/api/arquivos/${arquivoDoModelo.id}?download=1`} target="_blank" rel="noreferrer">
                  <FileTextIcon /> Baixar modelo
                </a>
              ) : (
                <a href={`/api/pdf/contrato/${contrato.id}`} target="_blank" rel="noreferrer">
                  <FileTextIcon /> Gerar PDF
                </a>
              )}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: CalendarRangeIcon, rotulo: "Período", valor: `${formatDate(contrato.dataInicio)} – ${formatDate(contrato.dataFim)}` },
          { icon: BanknoteIcon, rotulo: "Aluguel", valor: `${formatBRL(contrato.valorAluguel)}/mês`, destaque: true },
          { icon: CalendarClockIcon, rotulo: "Vencimento", valor: `Todo dia ${contrato.diaVencimento}` },
          { icon: TrendingUpIcon, rotulo: "Reajuste", valor: INDICE_REAJUSTE[contrato.indiceReajuste] },
        ].map(({ icon: Icon, rotulo, valor, destaque }, idx) => (
          <Card
            key={rotulo}
            className="animate-fade-up flex-row items-center gap-3 p-3 sm:p-4"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <span className="hidden size-9 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-primary-ink sm:flex">
              <Icon className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{rotulo}</p>
              <p className={cn("text-sm leading-snug font-semibold break-words", destaque && "text-primary-ink")}>{valor}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {contrato.partes.map((parte) => (
          <Badge
            key={parte.id}
            variant="outline"
            className={cn(
              "h-7 gap-1.5 bg-card px-3",
              parte.papel === "LOCATARIO" && "border-primary/40 bg-primary/10 text-primary-ink",
            )}
          >
            <UserIcon /> {PAPEL_CONTRATO[parte.papel]}: <span className="font-bold">{parte.pessoa.nome}</span>
          </Badge>
        ))}
        <Badge variant="outline" className="h-7 gap-1.5 bg-card px-3">
          <ShieldCheckIcon /> Garantia: {TIPO_GARANTIA[contrato.garantia]}
        </Badge>
      </div>

      <Tabs defaultValue="cobrancas">
        <TabsList>
          <TabsTrigger value="cobrancas">Cobranças ({contrato.cobrancas.length})</TabsTrigger>
          <TabsTrigger value="reajustes">Reajustes ({contrato.reajustes.length})</TabsTrigger>
          <TabsTrigger value="vistorias">Vistorias ({contrato.vistorias.length})</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos ({contrato.arquivos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cobrancas" className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/financeiro/cobrancas/${contrato.id}`}>
                <HandCoinsIcon /> Receber pagamentos
              </Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contrato.cobrancas.map((cobranca) => {
                  const status = statusEfetivo(cobranca.status, cobranca.vencimento, hoje);
                  const efetivo = STATUS_COBRANCA[status];
                  return (
                    <TableRow key={cobranca.id}>
                      <TableCell className="font-medium capitalize">
                        {formatMonth(cobranca.competencia)}
                        <span className="block text-xs font-normal text-muted-foreground normal-case sm:hidden">
                          vence {formatDate(cobranca.vencimento)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(cobranca.vencimento)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatBRL(cobranca.valorTotal)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge label={efetivo.label} tone={efetivo.tone} />
                      </TableCell>
                      <TableCell>
                        {status === "PAGO" && (
                          <Button variant="ghost" size="icon-sm" asChild aria-label="Baixar recibo">
                            <a href={`/api/pdf/recibo/${cobranca.id}`} target="_blank" rel="noreferrer">
                              <FileTextIcon />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Total do contrato: {formatBRL(sum(contrato.cobrancas.map((c) => c.valorTotal)))}
          </p>
        </TabsContent>

        <TabsContent value="reajustes" className="space-y-3">
          {contrato.reajustes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum reajuste aplicado ainda.
            </p>
          ) : (
            contrato.reajustes.map((reajuste) => (
              <Card key={reajuste.id}>
                <CardContent className="flex items-center justify-between text-sm">
                  <span>
                    {formatDate(reajuste.dataAplicacao)} · {INDICE_REAJUSTE[reajuste.indice]} ·{" "}
                    {reajuste.percentual.toString()}%
                  </span>
                  <span className="tabular-nums">
                    {formatBRL(reajuste.valorAnterior)} → {formatBRL(reajuste.valorNovo)}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="vistorias" className="space-y-3">
          {contrato.vistorias.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma vistoria registrada.
            </p>
          ) : (
            contrato.vistorias.map((vistoria) => (
              <Card key={vistoria.id}>
                <CardContent className="text-sm">
                  <p className="font-medium">
                    {TIPO_VISTORIA[vistoria.tipo]} · {formatDate(vistoria.data)}
                  </p>
                  {vistoria.observacoes && (
                    <p className="text-muted-foreground">{vistoria.observacoes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="arquivos" className="space-y-4">
          <FileUploader
            entidade="contrato"
            entidadeId={contrato.id}
            categoria="CONTRATO_ASSINADO"
            accept="application/pdf,.doc,.docx,.odt,.xls,.xlsx,image/jpeg,image/png"
            titulo="Envie o contrato assinado ou outros documentos"
            descricao="PDF, Word (doc/docx), Excel ou imagem"
          />
          <FileList
            arquivos={contrato.arquivos}
            vazio="Nenhum arquivo anexado (contrato assinado, etc.)."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
