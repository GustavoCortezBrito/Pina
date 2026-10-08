import {
  BedDoubleIcon,
  CarIcon,
  PawPrintIcon,
  PencilIcon,
  ShowerHeadIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { FileList } from "@/components/shared/file-list";
import { FileUploader } from "@/components/shared/file-uploader";
import { PageHeader } from "@/components/shared/page-header";
import { PhotoGallery } from "@/components/shared/photo-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { excluirImovel } from "@/features/imoveis/actions";
import { ImovelStatusSelect } from "@/features/imoveis/components/status-select";
import { obterImovel, resumoFinanceiroImovel } from "@/features/imoveis/queries";
import { STATUS_CONTRATO, STATUS_MANUTENCAO, TIPO_IMOVEL, PAPEL_CONTRATO } from "@/lib/labels";
import { formatDate, formatMonth } from "@/lib/dates";
import { formatEndereco } from "@/lib/format";
import { formatBRL } from "@/lib/money";
import { isAdmin, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Imóvel" };

export default async function ImovelDetalhePage(props: PageProps<"/imoveis/[id]">) {
  const { id } = await props.params;
  const [imovel, user] = await Promise.all([obterImovel(id), requireUser()]);
  if (!imovel) notFound();

  const financeiro = await resumoFinanceiroImovel(id);
  const fotos = imovel.arquivos.filter((a) => a.categoria === "FOTO");
  const documentos = imovel.arquivos.filter((a) => a.categoria !== "FOTO");
  const admin = isAdmin(user);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {imovel.titulo}
            <ImovelStatusSelect id={imovel.id} status={imovel.status} />
          </span>
        }
        description={
          <span>
            {imovel.codigo} · {TIPO_IMOVEL[imovel.tipo]} · {formatEndereco(imovel)}
          </span>
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/imoveis/${imovel.id}/editar`}>
                <PencilIcon /> Editar
              </Link>
            </Button>
            {admin && (
              <ConfirmAction
                trigger={
                  <Button variant="outline">
                    <Trash2Icon /> Excluir
                  </Button>
                }
                titulo="Excluir imóvel?"
                descricao="Só é possível excluir imóveis sem contratos registrados."
                confirmLabel="Excluir"
                action={excluirImovel.bind(null, imovel.id)}
              />
            )}
          </>
        }
      />

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BedDoubleIcon className="size-4" /> {imovel.quartos} quartos
        </span>
        <span className="flex items-center gap-1.5">
          <ShowerHeadIcon className="size-4" /> {imovel.banheiros} banheiros
        </span>
        <span className="flex items-center gap-1.5">
          <CarIcon className="size-4" /> {imovel.vagas} vagas
        </span>
        {imovel.areaM2 != null && (
          <span className="flex items-center gap-1.5">
            <SquareIcon className="size-4" /> {imovel.areaM2} m²
          </span>
        )}
        {imovel.aceitaPet && (
          <span className="flex items-center gap-1.5">
            <PawPrintIcon className="size-4" /> Aceita pet
          </span>
        )}
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="fotos">Fotos ({fotos.length})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({documentos.length})</TabsTrigger>
          <TabsTrigger value="contratos">Contratos ({imovel.contratos.length})</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="manutencoes">Manutenções ({imovel.manutencoes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Empreendimento</p>
                <p className="text-sm">{imovel.empreendimento?.nome ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Proprietário</p>
                <p className="text-sm">{imovel.proprietario?.nome ?? "Próprio"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aluguel sugerido</p>
                <p className="text-sm">{formatBRL(imovel.valorAluguel)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Condomínio</p>
                <p className="text-sm">{formatBRL(imovel.valorCondominio)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IPTU (ano)</p>
                <p className="text-sm">{formatBRL(imovel.valorIptuAnual)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Matrícula</p>
                <p className="text-sm">{imovel.matricula ?? "—"}</p>
              </div>
              {imovel.caracteristicas.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="mb-1.5 text-xs text-muted-foreground">Características</p>
                  <div className="flex flex-wrap gap-1.5">
                    {imovel.caracteristicas.map((c) => (
                      <Badge key={c} variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {imovel.descricao && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="text-sm whitespace-pre-line">{imovel.descricao}</p>
                </div>
              )}
              {imovel.observacoes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Observações internas</p>
                  <p className="text-sm whitespace-pre-line">{imovel.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fotos" className="space-y-4">
          <FileUploader entidade="imovel" entidadeId={imovel.id} categoria="FOTO" accept="image/jpeg,image/png,image/webp" titulo="Arraste as fotos ou clique para escolher" descricao="JPG, PNG ou WebP" />
          <PhotoGallery fotos={fotos} />
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <FileUploader entidade="imovel" entidadeId={imovel.id} categoria="DOCUMENTO" titulo="Matrícula, IPTU, contas..." />
          <FileList arquivos={documentos} />
        </TabsContent>

        <TabsContent value="contratos" className="space-y-3">
          {imovel.contratos.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum contrato registrado ainda.</p>
          ) : (
            imovel.contratos.map((contrato) => {
              const status = STATUS_CONTRATO[contrato.status];
              return (
                <Card key={contrato.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium">
                        Contrato nº {String(contrato.numero).padStart(4, "0")}{" "}
                        <Badge variant="secondary">{status.label}</Badge>
                      </p>
                      <p className="text-muted-foreground">
                        {formatDate(contrato.dataInicio)} até {formatDate(contrato.dataFim)} ·{" "}
                        {formatBRL(contrato.valorAluguel)}/mês
                      </p>
                      <p className="text-muted-foreground">
                        {contrato.partes
                          .map((parte) => `${PAPEL_CONTRATO[parte.papel]}: ${parte.pessoa.nome}`)
                          .join(" · ")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="financeiro">
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Recebido (total)</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatBRL(financeiro.recebido)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Em aberto</p>
                <p className="text-lg font-semibold">{formatBRL(financeiro.emAberto)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Despesas (total)</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {formatBRL(financeiro.despesas)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manutencoes" className="space-y-3">
          {imovel.manutencoes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma manutenção registrada.</p>
          ) : (
            imovel.manutencoes.map((m) => {
              const status = STATUS_MANUTENCAO[m.status];
              return (
                <Card key={m.id}>
                  <CardContent className="flex items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium">{m.titulo}</p>
                      <p className="text-muted-foreground">Aberta em {formatMonth(m.abertaEm)}</p>
                    </div>
                    <Badge variant="secondary">{status.label}</Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
      <Separator className="sr-only" />
    </div>
  );
}
