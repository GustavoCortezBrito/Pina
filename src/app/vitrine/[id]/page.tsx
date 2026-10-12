import {
  ArrowLeftIcon,
  BedDoubleIcon,
  CarIcon,
  CheckIcon,
  MapPinIcon,
  MessageCircleIcon,
  PawPrintIcon,
  RulerIcon,
  ShowerHeadIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GaleriaVitrine } from "@/features/vitrine/components/galeria";
import { obterImovelVitrine } from "@/features/vitrine/queries";
import { formatarWhatsapp, linkWhatsapp } from "@/features/vitrine/whatsapp";
import { TIPO_IMOVEL } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/vitrine/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const imovel = await obterImovelVitrine(id);
  if (!imovel) return { title: "Imóvel não encontrado" };
  const foto = imovel.arquivos[0]?.id;
  return {
    title: `${imovel.titulo} — ${imovel.bairro ?? imovel.cidade}`,
    description: imovel.descricao?.slice(0, 160) ?? `${TIPO_IMOVEL[imovel.tipo]} para alugar em ${imovel.cidade}.`,
    openGraph: foto ? { images: [`/api/vitrine/foto/${foto}?grande=1`] } : undefined,
  };
}

export default async function ImovelVitrinePage(props: PageProps<"/vitrine/[id]">) {
  const { id } = await props.params;
  const [imovel, { site }] = await Promise.all([obterImovelVitrine(id), getSettings()]);
  if (!imovel) notFound();

  const whats = linkWhatsapp(site.whatsapp, { titulo: imovel.titulo, codigo: imovel.codigo });
  const fatos = [
    { icon: BedDoubleIcon, rotulo: imovel.quartos === 1 ? "quarto" : "quartos", valor: imovel.quartos },
    { icon: ShowerHeadIcon, rotulo: imovel.banheiros === 1 ? "banheiro" : "banheiros", valor: imovel.banheiros },
    { icon: CarIcon, rotulo: imovel.vagas === 1 ? "vaga" : "vagas", valor: imovel.vagas },
    ...(imovel.areaM2 != null ? [{ icon: RulerIcon, rotulo: "m²", valor: imovel.areaM2 }] : []),
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 pb-28 lg:pb-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/vitrine">
          <ArrowLeftIcon /> Todos os imóveis
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-6">
          <GaleriaVitrine fotos={imovel.arquivos} titulo={imovel.titulo} />

          <div className="animate-fade-up space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/15 text-primary-ink">{TIPO_IMOVEL[imovel.tipo]}</Badge>
              {imovel.aceitaPet && (
                <Badge variant="outline" className="gap-1 bg-card">
                  <PawPrintIcon /> Aceita pet
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{imovel.titulo}</h1>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <MapPinIcon className="size-4" />
              {[imovel.bairro, `${imovel.cidade}/${imovel.uf}`].filter(Boolean).join(" · ")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {fatos.map(({ icon: Icon, rotulo, valor }, i) => (
              <Card
                key={rotulo}
                className="animate-fade-up flex-row items-center gap-3 p-3"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/14 text-primary-ink">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-lg leading-none font-bold tabular-nums">{valor}</span>
                  <span className="text-xs text-muted-foreground">{rotulo}</span>
                </span>
              </Card>
            ))}
          </div>

          {imovel.descricao && (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">Sobre o imóvel</h2>
              <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{imovel.descricao}</p>
            </section>
          )}

          {imovel.caracteristicas.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">Características</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {imovel.caracteristicas.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-success/15 text-success">
                      <CheckIcon className="size-3.5" />
                    </span>
                    <span className="capitalize">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="animate-scale-in gap-4 p-5 shadow-xl">
            <div>
              <p className="text-sm text-muted-foreground">Aluguel</p>
              {imovel.valorAluguel != null ? (
                <p className="text-3xl font-bold text-primary-ink tabular-nums">
                  {formatBRL(imovel.valorAluguel)}
                  <span className="ml-1 text-base font-medium text-muted-foreground">/mês</span>
                </p>
              ) : (
                <p className="text-xl font-bold">Consulte o valor</p>
              )}
              {imovel.valorCondominio != null && imovel.valorCondominio > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  + {formatBRL(imovel.valorCondominio)} de condomínio
                </p>
              )}
            </div>
            {whats ? (
              <Button
                asChild
                size="lg"
                className="h-12 w-full bg-[#25D366] text-base text-white shadow-[#25D366]/30 hover:bg-[#1fb857] hover:brightness-100"
              >
                <a href={whats} target="_blank" rel="noreferrer">
                  <MessageCircleIcon /> Tenho interesse
                </a>
              </Button>
            ) : null}
            <p className="text-center text-xs text-muted-foreground">
              {site.whatsapp ? `Atendimento pelo WhatsApp ${formatarWhatsapp(site.whatsapp)}` : "Fale com a gente"}
            </p>
          </Card>
        </aside>
      </div>

      {whats && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 p-3 backdrop-blur-md lg:hidden">
          <Button
            asChild
            size="lg"
            className="h-12 w-full bg-[#25D366] text-base text-white hover:bg-[#1fb857] hover:brightness-100"
          >
            <a href={whats} target="_blank" rel="noreferrer">
              <MessageCircleIcon /> Tenho interesse —{" "}
              {imovel.valorAluguel != null ? formatBRL(imovel.valorAluguel) : "consulte"}
            </a>
          </Button>
        </div>
      )}
    </main>
  );
}
