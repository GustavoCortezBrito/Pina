import { BedDoubleIcon, CarIcon, MapPinIcon, ShowerHeadIcon } from "lucide-react";
import Link from "next/link";
import { FotoCapa } from "@/components/shared/photo-gallery";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { formatEndereco } from "@/lib/format";
import { STATUS_IMOVEL, TIPO_IMOVEL } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import type { ImovelResumo } from "../queries";

export function ImovelCard({ imovel, index = 0 }: { imovel: ImovelResumo; index?: number }) {
  const status = STATUS_IMOVEL[imovel.status];
  const contrato = imovel.contratos[0];
  const locatario = contrato?.partes[0]?.pessoa.nome;

  return (
    <Link
      href={`/imoveis/${imovel.id}`}
      className="block animate-in rounded-xl duration-500 fill-mode-both fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <Card className="group h-full gap-0 overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-4/3 overflow-hidden">
          <FotoCapa
            arquivoId={imovel.arquivos[0]?.id}
            alt={imovel.titulo}
            className="size-full transition-transform duration-300 group-hover:scale-105"
          />
          <StatusBadge
            label={status.label}
            tone={status.tone}
            className="absolute top-3 right-3 h-7 px-3 text-sm shadow-sm"
          />
        </div>
        <div className="space-y-2 p-4">
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{imovel.titulo}</p>
            <p className="text-sm text-muted-foreground">
              {imovel.codigo} · {TIPO_IMOVEL[imovel.tipo]}
            </p>
          </div>
          {imovel.valorAluguel != null && (
            <p className="text-xl font-bold text-primary tabular-nums">
              {formatBRL(imovel.valorAluguel)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">/mês</span>
            </p>
          )}

          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" />
            {formatEndereco(imovel)}
          </p>

          <div className="flex items-center gap-4 border-t pt-2 text-sm font-medium">
            <span className="flex items-center gap-1">
              <BedDoubleIcon className="size-4 text-muted-foreground" /> {imovel.quartos}
            </span>
            <span className="flex items-center gap-1">
              <ShowerHeadIcon className="size-4 text-muted-foreground" /> {imovel.banheiros}
            </span>
            <span className="flex items-center gap-1">
              <CarIcon className="size-4 text-muted-foreground" /> {imovel.vagas}
            </span>
            {imovel.areaM2 != null && <span>{imovel.areaM2} m²</span>}
          </div>

          {locatario && (
            <p className="truncate text-sm text-muted-foreground">
              Inquilino: <span className="font-semibold text-foreground">{locatario}</span>
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
