import {
  ArrowUpRightIcon,
  Building2Icon,
  DoorOpenIcon,
  HouseIcon,
  LandPlotIcon,
  StoreIcon,
  WarehouseIcon,
} from "lucide-react";
import Link from "next/link";
import type { TipoImovel } from "@/generated/prisma/enums";
import { TIPO_IMOVEL } from "@/lib/labels";
import { Revelar } from "./animacao";

const ICONE: Record<TipoImovel, React.ComponentType<{ className?: string }>> = {
  CASA: HouseIcon,
  APARTAMENTO: Building2Icon,
  KITNET: DoorOpenIcon,
  SALA_COMERCIAL: StoreIcon,
  GALPAO: WarehouseIcon,
  TERRENO: LandPlotIcon,
  OUTRO: HouseIcon,
};

type Capa = { tipo: TipoImovel; total: number; foto: string | null };

/** Atalhos "explore por tipo": cada um leva à lista já filtrada, com a foto de um imóvel daquele tipo. */
export function TiposDestaque({ capas }: { capas: Capa[] }) {
  return (
    <section aria-labelledby="titulo-tipos" className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
      <Revelar>
        <p className="text-xs font-semibold tracking-[0.2em] text-primary-ink uppercase">Explore</p>
        <h2 id="titulo-tipos" className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Escolha pelo tipo de imóvel
        </h2>
      </Revelar>

      <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {capas.map((capa, i) => {
          const Icon = ICONE[capa.tipo];
          return (
            <li key={capa.tipo} className="w-[72%] shrink-0 snap-start sm:w-auto">
              <Revelar atraso={i * 0.08}>
                <Link
                  href={`/?tipo=${capa.tipo}#imoveis`}
                  scroll={false}
                  className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-surface-strong p-5 text-white ring-1 ring-border focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {capa.foto ? (
                    <img
                      src={`/api/vitrine/foto/${capa.foto}`}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                    />
                  ) : (
                    <span aria-hidden className="surface-brand absolute inset-0 -z-10" />
                  )}
                  <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-black/10 transition-opacity duration-500 group-hover:opacity-90" />
                  <span className="glass-dark absolute top-4 left-4 flex size-11 items-center justify-center rounded-2xl text-primary transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon className="size-5" />
                  </span>
                  <span className="flex items-end justify-between gap-3">
                    <span>
                      <span className="block font-display text-2xl font-medium">{TIPO_IMOVEL[capa.tipo]}</span>
                      <span className="mt-0.5 block text-sm text-white/70">
                        {capa.total} {capa.total === 1 ? "disponível" : "disponíveis"}
                      </span>
                    </span>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRightIcon className="size-5" />
                    </span>
                  </span>
                </Link>
              </Revelar>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
