import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BanknoteIcon,
  CircleDollarSignIcon,
  HandCoinsIcon,
  ReceiptTextIcon,
  ScaleIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatMonth } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { detalheFinanceiroImovel } from "../queries";

type Detalhe = Awaited<ReturnType<typeof detalheFinanceiroImovel>>;

const TONS = {
  success: { valor: "text-success", icone: "bg-success/14 text-success" },
  info: { valor: "text-info", icone: "bg-info/14 text-info" },
  danger: { valor: "text-danger", icone: "bg-danger/14 text-danger" },
  neutro: { valor: "text-foreground", icone: "bg-muted text-foreground" },
  brand: { valor: "text-primary-ink", icone: "bg-primary/16 text-primary-ink" },
} as const;

function Indicador({
  rotulo,
  valor,
  dica,
  tom,
  icon: Icon,
  href,
  delay,
}: {
  rotulo: string;
  valor: string;
  dica?: string;
  tom: keyof typeof TONS;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  delay: number;
}) {
  const corpo = (
    <Card
      className={cn(
        "h-full animate-fade-up gap-1.5 p-4",
        href && "transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-primary/45",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{rotulo}</span>
        <span className={cn("flex size-9 items-center justify-center rounded-xl", TONS[tom].icone)}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className={cn("text-2xl font-bold tabular-nums", TONS[tom].valor)}>{valor}</p>
      <p className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{dica}</span>
        {href && <ArrowRightIcon className="size-4 text-primary-ink transition-transform group-hover:translate-x-1" />}
      </p>
    </Card>
  );
  return href ? (
    <Link href={href} className="group block rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
      {corpo}
    </Link>
  ) : (
    corpo
  );
}

export function AbaFinanceiro({
  imovelId,
  dados,
  verDespesas,
}: {
  imovelId: string;
  dados: Detalhe;
  verDespesas: boolean;
}) {
  const cobrancas = dados.contratoId ? `/financeiro/cobrancas/${dados.contratoId}` : undefined;
  const despesas = `/financeiro/despesas?aba=despesas&imovel=${imovelId}`;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador
          rotulo="Recebido (total)"
          valor={formatBRL(dados.recebido)}
          dica="Ver cobranças"
          tom="success"
          icon={BanknoteIcon}
          href={cobrancas}
          delay={0}
        />
        <Indicador
          rotulo="Em aberto"
          valor={formatBRL(dados.emAberto)}
          dica={dados.proximas.length ? "Ver o que falta receber" : "Nada a receber"}
          tom="info"
          icon={HandCoinsIcon}
          href={cobrancas}
          delay={50}
        />
        <Indicador
          rotulo="Em atraso"
          valor={formatBRL(dados.atrasadasValor)}
          dica={dados.atrasadasQtde ? `${dados.atrasadasQtde} cobrança(s)` : "Tudo em dia"}
          tom={dados.atrasadasQtde ? "danger" : "neutro"}
          icon={AlertTriangleIcon}
          href={cobrancas}
          delay={100}
        />
        {verDespesas ? (
          <Indicador
            rotulo="Despesas (total)"
            valor={formatBRL(dados.despesas)}
            dica="Ver despesas do imóvel"
            tom="danger"
            icon={WalletIcon}
            href={despesas}
            delay={150}
          />
        ) : (
          <Indicador rotulo="Contas" valor="—" dica="Sem acesso a despesas" tom="neutro" icon={WalletIcon} delay={150} />
        )}
      </div>

      {verDespesas && (
        <Card
          className={cn(
            "animate-fade-up flex-row items-center justify-between gap-3 p-4 [animation-delay:200ms]",
            dados.resultado >= 0 ? "border-l-4 border-l-success" : "border-l-4 border-l-danger",
          )}
        >
          <span className="flex items-center gap-3">
            <span className={cn("flex size-10 items-center justify-center rounded-xl", dados.resultado >= 0 ? TONS.success.icone : TONS.danger.icone)}>
              <ScaleIcon className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-medium text-muted-foreground">Resultado líquido do imóvel</span>
              <span className="text-xs text-muted-foreground">recebido − despesas</span>
            </span>
          </span>
          <span className={cn("text-2xl font-bold tabular-nums", dados.resultado >= 0 ? TONS.success.valor : TONS.danger.valor)}>
            {formatBRL(dados.resultado)}
          </span>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-up gap-0 p-0 [animation-delay:250ms]">
          <div className="flex items-center justify-between gap-2 border-b px-5 py-3">
            <h3 className="flex items-center gap-2 font-bold">
              <ReceiptTextIcon className="size-4 text-primary-ink" /> Próximas cobranças
            </h3>
            {cobrancas && (
              <Link href={cobrancas} className="text-sm font-semibold text-primary-ink hover:underline">
                Ver todas
              </Link>
            )}
          </div>
          {dados.proximas.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma cobrança em aberto.</p>
          ) : (
            <ul className="divide-y">
              {dados.proximas.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/financeiro/cobrancas/${c.contratoId}`}
                    className="group flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-muted/60"
                  >
                    <span>
                      <span className="block font-medium capitalize">{formatMonth(c.competencia)}</span>
                      <span className="text-xs text-muted-foreground">vence {formatDate(c.vencimento)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusBadge label={c.atrasada ? "Atrasada" : "Pendente"} tone={c.atrasada ? "danger" : "warning"} />
                      <span className="font-bold tabular-nums">{formatBRL(c.saldo)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {verDespesas && (
          <Card className="animate-fade-up gap-0 p-0 [animation-delay:300ms]">
            <div className="flex items-center justify-between gap-2 border-b px-5 py-3">
              <h3 className="flex items-center gap-2 font-bold">
                <CircleDollarSignIcon className="size-4 text-primary-ink" /> Últimas despesas
              </h3>
              <Link href={despesas} className="text-sm font-semibold text-primary-ink hover:underline">
                Ver todas
              </Link>
            </div>
            {dados.ultimasDespesas.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma despesa registrada.</p>
            ) : (
              <ul className="divide-y">
                {dados.ultimasDespesas.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={despesas}
                      className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-muted/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{d.categoria.nome}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {formatDate(d.data)}
                          {d.fornecedor ? ` · ${d.fornecedor}` : ""}
                        </span>
                      </span>
                      <span className="font-bold text-danger tabular-nums">{formatBRL(d.valor)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
