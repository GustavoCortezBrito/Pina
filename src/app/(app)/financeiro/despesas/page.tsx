import { WalletIcon, WrenchIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { DespesasSecao } from "@/features/financeiro/despesas/components/despesas-secao";
import { ManutencoesSecao } from "@/features/manutencoes/components/manutencoes-secao";
import { can } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Despesas e manutenções" };

export default async function DespesasPage(props: PageProps<"/financeiro/despesas">) {
  const [params, user] = await Promise.all([props.searchParams, requireUser()]);
  const verDespesas = can(user.role, "despesas");

  // Quem não vê despesas (operador) só tem a aba de manutenções.
  const aba = verDespesas && params.aba !== "manutencoes" ? "despesas" : "manutencoes";

  const abas = [
    ...(verDespesas ? [{ id: "despesas", rotulo: "Despesas", icon: WalletIcon }] : []),
    { id: "manutencoes", rotulo: "Manutenções", icon: WrenchIcon },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={verDespesas ? "Despesas e manutenções" : "Manutenções"}
        description={
          verDespesas
            ? "Gastos dos imóveis e chamados de manutenção, juntos: cada manutenção mostra o que já custou."
            : undefined
        }
      />

      {abas.length > 1 && (
        <nav
          aria-label="Seções"
          className="inline-flex w-fit max-w-full gap-1 rounded-xl bg-muted p-1"
        >
          {abas.map(({ id, rotulo, icon: Icon }) => (
            <Link
              key={id}
              href={`/financeiro/despesas?aba=${id}`}
              scroll={false}
              aria-current={aba === id ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-all",
                aba === id
                  ? "bg-card font-semibold text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4", aba === id && "text-primary-ink")} />
              {rotulo}
            </Link>
          ))}
        </nav>
      )}

      {aba === "despesas" ? (
        <DespesasSecao params={params} />
      ) : (
        <ManutencoesSecao verDespesas={verDespesas} />
      )}
    </div>
  );
}
