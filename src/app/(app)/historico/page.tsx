import { ArrowRightIcon, HistoryIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ClearFilters, DateRangeFilter, FilterBar, FilterCombobox, FilterSelect } from "@/components/shared/filters";
import { AvatarFoto } from "@/components/shared/foto-perfil";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ACAO_LABEL,
  ENTIDADE_LABEL,
  FILTRO_ACAO,
  FILTRO_ENTIDADE,
  formatarValorCampo,
  rotuloCampo,
} from "@/features/historico/labels";
import { listarHistorico, TAMANHOS_PAGINA, usuariosParaFiltro } from "@/features/historico/queries";
import { formatDateTime } from "@/lib/dates";
import { ROLE_LABEL, normalizeRole } from "@/lib/permissions";
import { STATUS_CONTRATO, STATUS_IMOVEL, STATUS_MANUTENCAO, type Tone } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

const MAPAS_STATUS: Record<string, Record<string, { label: string; tone: Tone }>> = {
  Manutencao: STATUS_MANUTENCAO,
  Imovel: STATUS_IMOVEL,
  Contrato: STATUS_CONTRATO,
};

function rotuloStatus(entidade: string, status: string): { label: string; tone: Tone } {
  return MAPAS_STATUS[entidade]?.[status] ?? { label: status, tone: "neutral" };
}

export const metadata: Metadata = { title: "Histórico" };

const COR_TOM = {
  criou: "bg-success/14 text-success",
  editou: "bg-primary/15 text-primary-ink",
  excluiu: "bg-danger/14 text-danger",
  outro: "bg-muted text-muted-foreground",
} as const;

type Alteracoes = Record<string, { de: unknown; para: unknown }>;

function extrairAlteracoes(dados: Record<string, unknown> | null): Alteracoes | null {
  const alt = dados?.alteracoes;
  return alt && typeof alt === "object" && Object.keys(alt).length > 0 ? (alt as Alteracoes) : null;
}

export default async function HistoricoPage(props: PageProps<"/historico">) {
  const params = await props.searchParams;
  const ler = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);

  const [{ itens, total, page, pageCount, porPagina }, usuarios] = await Promise.all([
    listarHistorico({
      usuarioId: ler("usuario"),
      entidade: ler("entidade"),
      acao: ler("acao"),
      de: ler("de"),
      ate: ler("ate"),
      porPagina: Number(ler("porPagina") ?? 0),
      page: Number(ler("page") ?? 1),
    }),
    usuariosParaFiltro(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de alterações"
        description="Quem fez o quê, e quando, em qualquer parte do sistema."
      />

      <FilterBar>
        <FilterCombobox
          param="usuario"
          placeholder="Usuário"
          allLabel="Todos"
          buscaPlaceholder="Digite o nome do usuário..."
          options={usuarios.map((u) => ({ value: u.id, label: u.name }))}
        />
        <FilterCombobox
          param="entidade"
          placeholder="Onde"
          allLabel="Todos"
          buscaPlaceholder="Digite: imóvel, contrato..."
          options={FILTRO_ENTIDADE}
        />
        <FilterSelect param="acao" placeholder="Ação" allLabel="Todas" options={FILTRO_ACAO} />
        <DateRangeFilter />
        <ClearFilters />
      </FilterBar>

      {itens.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum registro encontrado</EmptyTitle>
            <EmptyDescription>Ajuste os filtros ou espere as próximas alterações.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="space-y-2">
            {itens.map((item, index) => {
              const acao = ACAO_LABEL[item.acao] ?? { verbo: item.acao.toLowerCase(), tom: "outro" as const };
              const lugar = ENTIDADE_LABEL[item.entidade] ?? item.entidade.toLowerCase();
              const alteracoes = extrairAlteracoes(item.dados);
              const nomeUsuario = item.usuario?.name ?? "Sistema";
              const ehLogin = item.acao === "LOGIN";

              return (
                <Card
                  key={item.id}
                  className="animate-fade-up gap-2 p-4 hover:shadow-md"
                  style={{ animationDelay: `${Math.min(index, 10) * 20}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <AvatarFoto
                      nome={nomeUsuario}
                      src={item.usuario?.image}
                      className="size-10"
                      fallbackClassName={cn("text-sm", COR_TOM[acao.tom])}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-base leading-snug">
                        <span className="font-semibold">{nomeUsuario}</span>{" "}
                        <span className="text-muted-foreground">{acao.verbo}</span>
                        {!ehLogin && (
                          <>
                            {" "}
                            <span className="text-muted-foreground">{lugar}</span>{" "}
                            {item.alvo ? (
                              item.alvo.href ? (
                                <Link href={item.alvo.href} className="font-semibold underline-offset-4 hover:text-primary-ink hover:underline">
                                  {item.alvo.rotulo}
                                </Link>
                              ) : (
                                <span className="font-semibold">{item.alvo.rotulo}</span>
                              )
                            ) : item.removido ? (
                              <span className="text-muted-foreground italic">(registro removido)</span>
                            ) : null}
                          </>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(item.criadoEm)}
                        {item.usuario?.role && <> · {ROLE_LABEL[normalizeRole(item.usuario.role)]}</>}
                      </p>

                      {alteracoes && (
                        <ul className="mt-2 space-y-1 rounded-lg bg-muted/60 p-3 text-sm">
                          {Object.entries(alteracoes).map(([campo, { de, para }]) => (
                            <li key={campo} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="font-medium">{rotuloCampo(campo)}:</span>
                              <span className="text-muted-foreground line-through decoration-muted-foreground/50">
                                {formatarValorCampo(campo, de)}
                              </span>
                              <ArrowRightIcon className="size-3.5 text-primary-ink" />
                              <span className="font-semibold">{formatarValorCampo(campo, para)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.acao === "REAJUSTE" && item.dados && (
                        <p className="text-sm text-muted-foreground">
                          {formatarValorCampo("valorAnterior", item.dados.valorAnterior)} →{" "}
                          <span className="font-semibold text-foreground">
                            {formatarValorCampo("valorNovo", item.dados.valorNovo)}
                          </span>
                          {item.dados.percentual != null && <> ({String(item.dados.percentual)}%)</>}
                        </p>
                      )}
                      {item.acao === "RECEBER" && item.dados?.valorPago != null && (
                        <p className="text-sm text-muted-foreground">
                          Valor recebido:{" "}
                          <span className="font-semibold text-foreground">
                            {formatarValorCampo("valorPago", item.dados.valorPago)}
                          </span>
                        </p>
                      )}
                      {item.acao === "UPDATE_STATUS" && item.dados?.status != null && (
                        <p className="text-sm text-muted-foreground">
                          Novo status:{" "}
                          <StatusBadge
                            {...rotuloStatus(item.entidade, String(item.dados.status))}
                          />
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            total={total}
            label="registros"
            porPagina={porPagina}
            tamanhos={TAMANHOS_PAGINA}
          />
        </>
      )}
    </div>
  );
}
