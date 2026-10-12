import { MailIcon, MessageCircleIcon, PhoneIcon, PlusIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { FilterBar, FilterSelect, SearchInput } from "@/components/shared/filters";
import { AvatarFoto } from "@/components/shared/foto-perfil";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PapelPessoa } from "@/generated/prisma/enums";
import { listarPessoas } from "@/features/pessoas/queries";
import { formatDocumento, formatPhone, whatsappLink } from "@/lib/format";
import { options, PAPEL_PESSOA, TIPO_PESSOA } from "@/lib/labels";

export const metadata: Metadata = { title: "Pessoas" };

const TEMA_PAPEL: Record<PapelPessoa, { faixa: string; avatar: string; badge: string }> = {
  INQUILINO: {
    faixa: "bg-primary",
    avatar: "bg-primary text-primary-foreground",
    badge: "bg-primary/15 text-primary-ink ring-1 ring-inset ring-primary/35",
  },
  FIADOR: {
    faixa: "bg-primary",
    avatar: "bg-primary text-primary-foreground",
    badge: "bg-transparent text-primary-ink ring-1 ring-inset ring-primary/60",
  },
  PROPRIETARIO: {
    faixa: "bg-primary",
    avatar: "bg-primary text-primary-foreground",
    badge: "bg-primary text-primary-foreground",
  },
};

export default async function PessoasPage(props: PageProps<"/pessoas">) {
  const params = await props.searchParams;
  const lerParam = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);
  const papelParam = lerParam("papel");

  const { itens, total, page, pageCount } = await listarPessoas({
    q: lerParam("q"),
    papel: Object.values(PapelPessoa).includes(papelParam as PapelPessoa)
      ? (papelParam as PapelPessoa)
      : undefined,
    page: Number(lerParam("page") ?? 1),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pessoas"
        description="Inquilinos, fiadores e proprietários."
        actions={
          <Button size="lg" asChild>
            <Link href="/pessoas/novo">
              <PlusIcon /> Nova pessoa
            </Link>
          </Button>
        }
      />

      <FilterBar>
        <SearchInput placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone..." />
        <FilterSelect param="papel" placeholder="Papel" options={options(PAPEL_PESSOA)} />
      </FilterBar>

      {itens.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma pessoa encontrada</EmptyTitle>
            <EmptyDescription>Ajuste os filtros ou cadastre a primeira pessoa.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {itens.map((pessoa, index) => {
              const link = whatsappLink(pessoa.telefone1);
              const tema = TEMA_PAPEL[pessoa.papeis[0]] ?? TEMA_PAPEL.INQUILINO;
              return (
                <Card
                  key={pessoa.id}
                  className="group animate-in overflow-hidden p-0 transition-all duration-500 fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-1 hover:shadow-lg"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <Link href={`/pessoas/${pessoa.id}`} className="block">
                    <div className={`h-1.5 ${tema.faixa}`} />
                    <div className="flex flex-col items-center px-5 pt-5 pb-4 text-center">
                      <AvatarFoto
                        nome={pessoa.nome}
                        arquivoId={pessoa.arquivos[0]?.id}
                        className="size-20 shadow-md transition-transform duration-300 group-hover:scale-105"
                        fallbackClassName={`text-2xl ${tema.avatar}`}
                      />
                      <p className="mt-3 w-full truncate text-lg font-semibold">{pessoa.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {TIPO_PESSOA[pessoa.tipo]} · {formatDocumento(pessoa.documento)}
                      </p>
                      <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                        {pessoa.papeis.map((papel) => (
                          <Badge
                            key={papel}
                            variant="outline"
                            className={`border-transparent font-semibold ${TEMA_PAPEL[papel].badge}`}
                          >
                            {PAPEL_PESSOA[papel]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Link>

                  <div className="space-y-2 border-t px-5 py-3.5">
                    {pessoa.telefone1 ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                          <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{formatPhone(pessoa.telefone1)}</span>
                        </span>
                        {pessoa.telefone1Whats && link && (
                          <Button size="sm" variant="outline" className="shrink-0" asChild>
                            <a href={link} target="_blank" rel="noreferrer">
                              <MessageCircleIcon /> WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem telefone cadastrado</p>
                    )}
                    {pessoa.email && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MailIcon className="size-4 shrink-0" />
                        <span className="truncate">{pessoa.email}</span>
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination page={page} pageCount={pageCount} total={total} label="pessoas" />
        </>
      )}
    </div>
  );
}
