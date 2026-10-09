import { MessageCircleIcon, PlusIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { FilterBar, FilterSelect, SearchInput } from "@/components/shared/filters";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PapelPessoa } from "@/generated/prisma/enums";
import { listarPessoas } from "@/features/pessoas/queries";
import { formatDocumento, formatPhone, initials, whatsappLink } from "@/lib/format";
import { options, PAPEL_PESSOA, TIPO_PESSOA } from "@/lib/labels";

export const metadata: Metadata = { title: "Pessoas" };

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
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {itens.map((pessoa, index) => {
              const link = whatsappLink(pessoa.telefone1);
              return (
                <Card
                  key={pessoa.id}
                  className="animate-in transition-all duration-500 fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <CardContent className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
                    <Link href={`/pessoas/${pessoa.id}`} className="contents">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary">
                        {initials(pessoa.nome)}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="truncate text-base font-semibold">{pessoa.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {TIPO_PESSOA[pessoa.tipo]} · {formatDocumento(pessoa.documento)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {pessoa.papeis.map((papel) => (
                            <Badge key={papel} variant="secondary">
                              {PAPEL_PESSOA[papel]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Link>

                    {pessoa.telefone1 && (
                      <div className="w-full shrink-0 text-right sm:w-auto">
                        <p className="text-sm font-medium whitespace-nowrap">
                          {formatPhone(pessoa.telefone1)}
                        </p>
                        {pessoa.telefone1Whats && link && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1.5 w-full border-emerald-600/30 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 sm:w-auto dark:text-emerald-400"
                            asChild
                          >
                            <a href={link} target="_blank" rel="noreferrer">
                              <MessageCircleIcon /> WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
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
