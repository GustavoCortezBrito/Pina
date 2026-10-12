import {
  BedDoubleIcon,
  CarIcon,
  PawPrintIcon,
  ExternalLinkIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { excluirImovel } from "@/features/imoveis/actions";
import { PublicarSiteButton } from "@/features/imoveis/components/publicar-site-button";
import { can } from "@/lib/permissions";
import { ImovelStatusSelect } from "@/features/imoveis/components/status-select";
import { AbaContratos } from "@/features/imoveis/components/aba-contratos";
import { AbaFinanceiro } from "@/features/imoveis/components/aba-financeiro";
import { AbaManutencoes } from "@/features/imoveis/components/aba-manutencoes";
import { detalheFinanceiroImovel, obterImovel } from "@/features/imoveis/queries";
import { TIPO_IMOVEL } from "@/lib/labels";
import { formatEndereco } from "@/lib/format";
import { formatBRL } from "@/lib/money";
import { isAdmin, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Imóvel" };

export default async function ImovelDetalhePage(props: PageProps<"/imoveis/[id]">) {
  const { id } = await props.params;
  const [imovel, user] = await Promise.all([obterImovel(id), requireUser()]);
  if (!imovel) notFound();

  const financeiro = await detalheFinanceiroImovel(id);
  const fotos = imovel.arquivos.filter((a) => a.categoria === "FOTO");
  const documentos = imovel.arquivos.filter((a) => a.categoria !== "FOTO");
  const admin = isAdmin(user);

  return (
    <div className="space-y-6">
      <PageHeader voltar={"/imoveis"}
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
            {can(user.role, "publicarSite") && (
              <>
                <PublicarSiteButton id={imovel.id} publicado={imovel.publicadoNoSite} />
                {imovel.publicadoNoSite && imovel.status === "DISPONIVEL" && (
                  <Button variant="outline" asChild>
                    <a href={`/vitrine/${imovel.id}`} target="_blank" rel="noreferrer">
                      <ExternalLinkIcon /> Ver no site
                    </a>
                  </Button>
                )}
              </>
            )}
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

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="flex animate-scale-in items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-medium shadow-sm ring-1 ring-border [&_svg]:text-primary-ink">
          <BedDoubleIcon className="size-4" /> {imovel.quartos} quartos
        </span>
        <span className="flex animate-scale-in items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-medium shadow-sm ring-1 ring-border [&_svg]:text-primary-ink">
          <ShowerHeadIcon className="size-4" /> {imovel.banheiros} banheiros
        </span>
        <span className="flex animate-scale-in items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-medium shadow-sm ring-1 ring-border [&_svg]:text-primary-ink">
          <CarIcon className="size-4" /> {imovel.vagas} vagas
        </span>
        {imovel.areaM2 != null && (
          <span className="flex animate-scale-in items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-medium shadow-sm ring-1 ring-border [&_svg]:text-primary-ink">
            <SquareIcon className="size-4" /> {imovel.areaM2} m²
          </span>
        )}
        {imovel.aceitaPet && (
          <span className="flex animate-scale-in items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-medium shadow-sm ring-1 ring-border [&_svg]:text-primary-ink">
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
            <CardContent className="grid grid-cols-2 gap-4">
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
                <div className="col-span-2">
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
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="text-sm whitespace-pre-line">{imovel.descricao}</p>
                </div>
              )}
              {imovel.observacoes && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Observações internas</p>
                  <p className="text-sm whitespace-pre-line">{imovel.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fotos" className="space-y-4">
          <FileUploader
            entidade="imovel"
            entidadeId={imovel.id}
            categoria="FOTO"
            accept="image/jpeg,image/png,image/webp"
            titulo="Arraste as fotos ou clique para escolher"
            descricao="JPG, PNG ou WebP"
          />
          <PhotoGallery fotos={fotos} />
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <FileUploader
            entidade="imovel"
            entidadeId={imovel.id}
            categoria="DOCUMENTO"
            titulo="Matrícula, IPTU, contas..."
          />
          <FileList arquivos={documentos} />
        </TabsContent>

        <TabsContent value="contratos">
          <AbaContratos contratos={imovel.contratos} />
        </TabsContent>

        <TabsContent value="financeiro">
          <AbaFinanceiro imovelId={imovel.id} dados={financeiro} verDespesas={can(user.role, "despesas")} />
        </TabsContent>

        <TabsContent value="manutencoes">
          <AbaManutencoes manutencoes={imovel.manutencoes} verDespesas={can(user.role, "despesas")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
