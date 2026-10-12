import { ArrowRightIcon, Building2Icon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatEndereco } from "@/lib/format";
import type { listarEmpreendimentos } from "../queries";

type EmpreendimentoResumo = Awaited<ReturnType<typeof listarEmpreendimentos>>[number];

function Numero({
  valor,
  rotulo,
  className,
}: {
  valor: number;
  rotulo: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg px-2 py-1.5 text-center ${className ?? "bg-muted"}`}>
      <p className="text-xl leading-none font-bold tabular-nums">{valor}</p>
      <p className="mt-0.5 text-xs font-semibold">{rotulo}</p>
    </div>
  );
}

export function EmpreendimentoCard({
  empreendimento,
  index = 0,
}: {
  empreendimento: EmpreendimentoResumo;
  index?: number;
}) {
  return (
    <Link
      href={`/empreendimentos/${empreendimento.id}`}
      className="group block animate-fade-up rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <Card className="h-full gap-3 border-t-4 border-t-primary py-4 duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-primary/45">
        <div className="flex items-center gap-3 px-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-brand-deep text-primary-foreground shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <Building2Icon className="size-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg leading-tight font-bold">{empreendimento.nome}</h2>
            <p className="mt-0.5 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" />
              <span>{formatEndereco(empreendimento)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4">
          <Numero valor={empreendimento.unidades} rotulo="Unidades" />
          <Numero
            valor={empreendimento.alugadas}
            rotulo="Alugadas"
            className="bg-success/12 text-success"
          />
          <Numero
            valor={empreendimento.vagas}
            rotulo="Disponíveis"
            className="bg-primary/15 text-primary-ink"
          />
        </div>

        <div className="space-y-1.5 px-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ocupação</span>
            <span className="text-base font-bold">{empreendimento.ocupacao}%</span>
          </div>
          <Progress value={empreendimento.ocupacao} className="h-2.5" />
        </div>

        <div className="mx-4 flex items-center justify-between border-t pt-3 text-sm font-semibold text-primary-ink">
          Ver unidades
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
