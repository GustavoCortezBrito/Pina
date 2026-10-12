import {
  BedDoubleIcon,
  CarIcon,
  CheckIcon,
  ChevronRightIcon,
  HashIcon,
  MapPinIcon,
  PawPrintIcon,
  RulerIcon,
  ShieldCheckIcon,
  ShowerHeadIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GaleriaVitrine } from "@/features/vitrine/components/galeria";
import { VitrineCard } from "@/features/vitrine/components/vitrine-card";
import { WhatsappIcon } from "@/features/vitrine/components/whatsapp-icon";
import { obterImovelVitrine, outrosImoveis } from "@/features/vitrine/queries";
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
  const outros = await outrosImoveis(imovel.id, imovel.tipo);

  const whats = linkWhatsapp(site.whatsapp, { titulo: imovel.titulo, codigo: imovel.codigo });
  const condominio = imovel.valorCondominio != null && imovel.valorCondominio > 0 ? imovel.valorCondominio : null;
  const fatos = [
    { icon: BedDoubleIcon, rotulo: imovel.quartos === 1 ? "Quarto" : "Quartos", valor: imovel.quartos },
    { icon: ShowerHeadIcon, rotulo: imovel.banheiros === 1 ? "Banheiro" : "Banheiros", valor: imovel.banheiros },
    { icon: CarIcon, rotulo: imovel.vagas === 1 ? "Vaga" : "Vagas", valor: imovel.vagas },
    ...(imovel.areaM2 != null ? [{ icon: RulerIcon, rotulo: "Área (m²)", valor: imovel.areaM2 }] : []),
  ];
  const local = [imovel.bairro, `${imovel.cidade}/${imovel.uf}`].filter(Boolean).join(" · ");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-32 sm:px-6 lg:pb-10">
      {/* Trilha */}
      <nav aria-label="Trilha" className="flex animate-fade-in items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/vitrine" className="transition-colors hover:text-foreground">
          Imóveis
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <Link href={`/vitrine?tipo=${imovel.tipo}#imoveis`} className="transition-colors hover:text-foreground">
          {TIPO_IMOVEL[imovel.tipo]}
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <span className="truncate text-foreground">{imovel.titulo}</span>
      </nav>

      {/* Título */}
      <header className="mt-5 mb-7 flex animate-fade-up flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-primary to-brand-deep px-3 py-1 text-xs font-semibold tracking-wide text-primary-foreground">
              {TIPO_IMOVEL[imovel.tipo]}
            </span>
            {imovel.aceitaPet && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium">
                <PawPrintIcon className="size-3.5 text-primary-ink" /> Aceita pet
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <HashIcon className="size-3" /> Cód. {imovel.codigo}
            </span>
          </div>
          <h1 className="font-display text-4xl leading-[1.05] font-medium tracking-tight text-balance sm:text-5xl">
            {imovel.titulo}
          </h1>
          <p className="flex items-center gap-1.5 text-lg text-muted-foreground">
            <MapPinIcon className="size-4.5 text-primary-ink" /> {local}
          </p>
        </div>
      </header>

      <GaleriaVitrine fotos={imovel.arquivos} titulo={imovel.titulo} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <div className="min-w-0 space-y-12">
          {/* Números */}
          <ul
            className={`grid gap-px overflow-hidden rounded-[1.75rem] bg-border ring-1 ring-border ${
              fatos.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"
            }`}
          >
            {fatos.map(({ icon: Icon, rotulo, valor }, i) => (
              <li
                key={rotulo}
                className="flex animate-fade-up flex-col items-start gap-3 bg-card p-5 sm:p-6"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary-ink">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-display text-3xl leading-none font-medium tabular-nums">{valor}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{rotulo}</span>
                </span>
              </li>
            ))}
          </ul>

          {imovel.descricao && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">Sobre o imóvel</h2>
              <p className="text-lg leading-relaxed whitespace-pre-line text-muted-foreground">{imovel.descricao}</p>
            </section>
          )}

          {imovel.caracteristicas.length > 0 && (
            <section className="space-y-5">
              <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">O que este imóvel oferece</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {imovel.caracteristicas.map((c) => (
                  <li
                    key={c}
                    className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border transition-colors hover:ring-primary/40"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-success/12 text-success">
                      <CheckIcon className="size-4" />
                    </span>
                    <span className="font-medium first-letter:uppercase">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex items-start gap-4 rounded-[1.75rem] bg-muted/60 p-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card text-primary-ink ring-1 ring-border">
              <ShieldCheckIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Localização preservada</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Por segurança, o endereço exato é informado no atendimento. O imóvel fica em {local}.
              </p>
            </div>
          </section>
        </div>

        {/* Cartão de preço */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border-gradient-brand animate-scale-in overflow-hidden rounded-[2rem] bg-card p-7 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.4)]">
            <span aria-hidden className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-primary/15 blur-3xl" />
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Aluguel mensal</p>
            {imovel.valorAluguel != null ? (
              <p className="mt-2 font-display text-5xl font-medium tracking-tight tabular-nums">
                {formatBRL(imovel.valorAluguel)}
              </p>
            ) : (
              <p className="mt-2 font-display text-3xl font-medium">Consulte o valor</p>
            )}

            {condominio != null && (
              <dl className="mt-6 space-y-2.5 border-t border-dashed pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Aluguel</dt>
                  <dd className="font-medium tabular-nums">
                    {imovel.valorAluguel != null ? formatBRL(imovel.valorAluguel) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Condomínio</dt>
                  <dd className="font-medium tabular-nums">{formatBRL(condominio)}</dd>
                </div>
                {imovel.valorAluguel != null && (
                  <div className="flex justify-between border-t pt-2.5 text-base">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-semibold text-primary-ink tabular-nums">
                      {formatBRL(imovel.valorAluguel + condominio)}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {whats && (
              <a
                href={whats}
                target="_blank"
                rel="noreferrer"
                id="imovel-tenho-interesse"
                className="btn-whatsapp mt-7 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl text-base font-semibold transition-all hover:-translate-y-0.5"
              >
                <WhatsappIcon /> Tenho interesse
              </a>
            )}
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {site.whatsapp ? (
                <>
                  Atendimento pelo WhatsApp <span className="font-medium text-foreground">{formatarWhatsapp(site.whatsapp)}</span>
                </>
              ) : (
                "Fale com a gente"
              )}
            </p>
            <p className="mt-5 rounded-xl bg-muted/70 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground">
              A mensagem já vai pronta com o código <span className="font-semibold text-foreground">{imovel.codigo}</span>.
            </p>
          </div>
        </aside>
      </div>

      {outros.length > 0 && (
        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary-ink uppercase">Continue explorando</p>
              <h2 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">Outros imóveis</h2>
            </div>
            <Link
              href="/vitrine#imoveis"
              className="hidden items-center gap-1 text-sm font-semibold text-primary-ink hover:underline sm:inline-flex"
            >
              Ver todos <ChevronRightIcon className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {outros.map((o, i) => (
              <VitrineCard key={o.id} imovel={o} index={i} />
            ))}
          </div>
        </section>
      )}

      {whats && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-xs text-muted-foreground">Aluguel</p>
              <p className="truncate font-display text-xl font-medium tabular-nums">
                {imovel.valorAluguel != null ? formatBRL(imovel.valorAluguel) : "Consulte"}
                {imovel.valorAluguel != null && <span className="font-sans text-sm text-muted-foreground">/mês</span>}
              </p>
            </div>
            <a
              href={whats}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp flex h-12 shrink-0 items-center gap-2 rounded-full px-6 font-semibold"
            >
              <WhatsappIcon /> Tenho interesse
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
