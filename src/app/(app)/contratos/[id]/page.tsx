import { FileTextIcon } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileList } from "@/components/shared/file-list";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EncerrarDialog } from "@/features/contratos/components/encerrar-dialog";
import { ReajusteDialog } from "@/features/contratos/components/reajuste-dialog";
import { obterContrato } from "@/features/contratos/queries";
import { statusEfetivo } from "@/features/financeiro/services/encargos";
import { formatDate } from "@/lib/dates";
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

export const metadata: Metadata = { title: "Contrato" };

export default async function ContratoDetalhePage(props: PageProps<"/contratos/[id]">) {
  const { id } = await props.params;
  const contrato = await obterContrato(id);
  if (!contrato) notFound();

  const status = STATUS_CONTRATO[contrato.status];
  const hoje = today();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            Contrato nº {formatNumeroContrato(contrato.numero)}
            <StatusBadge label={status.label} tone={status.tone} />
          </span>
        }
        description={`${contrato.imovel.titulo} (${contrato.imovel.codigo}) · ${FINALIDADE[contrato.finalidade]}`}
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
              <a href={`/api/pdf/contrato/${contrato.id}`} target="_blank" rel="noreferrer">
                <FileTextIcon /> Gerar PDF
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Período</p>
          <p className="text-sm font-medium">
            {formatDate(contrato.dataInicio)} – {formatDate(contrato.dataFim)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Aluguel</p>
          <p className="text-sm font-medium">{formatBRL(contrato.valorAluguel)}/mês</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Vencimento</p>
          <p className="text-sm font-medium">Dia {contrato.diaVencimento}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Reajuste</p>
          <p className="text-sm font-medium">{INDICE_REAJUSTE[contrato.indiceReajuste]}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        {contrato.partes.map((parte) => (
          <Badge key={parte.id} variant="secondary">
            {PAPEL_CONTRATO[parte.papel]}: {parte.pessoa.nome}
          </Badge>
        ))}
        <Badge variant="outline">{TIPO_GARANTIA[contrato.garantia]}</Badge>
      </div>

      <Tabs defaultValue="cobrancas">
        <TabsList>
          <TabsTrigger value="cobrancas">Cobranças ({contrato.cobrancas.length})</TabsTrigger>
          <TabsTrigger value="reajustes">Reajustes ({contrato.reajustes.length})</TabsTrigger>
          <TabsTrigger value="vistorias">Vistorias ({contrato.vistorias.length})</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos ({contrato.arquivos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cobrancas">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead>Vencimento</TableHead>
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
                      <TableCell className="capitalize">{formatDate(cobranca.competencia)}</TableCell>
                      <TableCell>{formatDate(cobranca.vencimento)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatBRL(cobranca.valorTotal)}</TableCell>
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
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum reajuste aplicado ainda.</p>
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
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma vistoria registrada.</p>
          ) : (
            contrato.vistorias.map((vistoria) => (
              <Card key={vistoria.id}>
                <CardContent className="text-sm">
                  <p className="font-medium">
                    {TIPO_VISTORIA[vistoria.tipo]} · {formatDate(vistoria.data)}
                  </p>
                  {vistoria.observacoes && <p className="text-muted-foreground">{vistoria.observacoes}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="arquivos">
          <FileList arquivos={contrato.arquivos} vazio="Nenhum arquivo anexado (contrato assinado, etc.)." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
