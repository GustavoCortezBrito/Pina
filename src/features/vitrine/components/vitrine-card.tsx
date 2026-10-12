import {
  ArrowRightIcon,
  BedDoubleIcon,
  CarIcon,
  ImageIcon,
  MapPinIcon,
  RulerIcon,
  ShowerHeadIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TIPO_IMOVEL } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import type { ImovelVitrine } from "../queries";

export function VitrineCard({ imovel, index = 0 }: { imovel: ImovelVitrine; index?: number }) {
  const foto = imovel.arquivos[0]?.id;
  return (
    <Link
      href={`/vitrine/${imovel.id}`}
      className="group block animate-fade-up rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <Card className="h-full gap-0 overflow-hidden p-0 duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-primary/45">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {foto ? (
            <img
              src={`/api/vitrine/foto/${foto}`}
              alt={imovel.titulo}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent"
          />
          <Badge className="absolute top-3 left-3 bg-card/95 text-foreground shadow-md backdrop-blur-sm">
            {TIPO_IMOVEL[imovel.tipo]}
          </Badge>
        </div>
        <div className="space-y-2.5 p-4">
          <h2 className="truncate text-base font-bold transition-colors group-hover:text-primary-ink">
            {imovel.titulo}
          </h2>
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" />
            {[imovel.bairro, imovel.cidade].filter(Boolean).join(" · ")}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2.5 text-sm font-medium">
            <span className="flex items-center gap-1">
              <BedDoubleIcon className="size-4 text-primary-ink" /> {imovel.quartos}
            </span>
            <span className="flex items-center gap-1">
              <ShowerHeadIcon className="size-4 text-primary-ink" /> {imovel.banheiros}
            </span>
            <span className="flex items-center gap-1">
              <CarIcon className="size-4 text-primary-ink" /> {imovel.vagas}
            </span>
            {imovel.areaM2 != null && (
              <span className="flex items-center gap-1">
                <RulerIcon className="size-4 text-primary-ink" /> {imovel.areaM2} m²
              </span>
            )}
          </div>
          <div className="flex items-end justify-between pt-1">
            {imovel.valorAluguel != null ? (
              <p className="text-xl font-bold text-primary-ink tabular-nums">
                {formatBRL(imovel.valorAluguel)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">/mês</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground">Consulte o valor</p>
            )}
            <ArrowRightIcon className="size-5 text-primary-ink transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
