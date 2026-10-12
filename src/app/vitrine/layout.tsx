import { ArrowUpRightIcon, MapPinIcon } from "lucide-react";
import { Fraunces } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { VitrineHeader } from "@/features/vitrine/components/vitrine-header";
import { WhatsappIcon } from "@/features/vitrine/components/whatsapp-icon";
import { formatarWhatsapp, linkWhatsapp } from "@/features/vitrine/whatsapp";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

// Serifada elegante só nos títulos da vitrine; o painel interno continua com Inter.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", style: ["normal", "italic"] });

export default async function VitrineLayout({ children }: { children: React.ReactNode }) {
  const { site, locador } = await getSettings();
  const whats = linkWhatsapp(site.whatsapp);
  const cidade = locador.cidade || "Barretos/SP";

  return (
    <div className={cn("flex min-h-svh flex-col bg-background", fraunces.variable)}>
      <VitrineHeader whats={whats} />

      <div className="flex-1">{children}</div>

      <footer id="contato" className="surface-brand relative mt-24 overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo className="text-white [&_.text-muted-foreground]:text-white/55 [&_svg]:size-10" />
            <p className="max-w-sm leading-relaxed text-white/65">{site.chamada}</p>
            {whats && (
              <a
                href={whats}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold transition-all hover:-translate-y-0.5"
              >
                <WhatsappIcon /> Fale com a gente
              </a>
            )}
          </div>

          <nav aria-label="Rodapé" className="space-y-4">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Navegue</h2>
            <ul className="space-y-3 text-white/75">
              {[
                { href: "/vitrine#imoveis", rotulo: "Imóveis disponíveis" },
                { href: "/vitrine#como-funciona", rotulo: "Como funciona" },
                { href: "/login", rotulo: "Área restrita" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group inline-flex items-center gap-1 transition-colors hover:text-white">
                    {l.rotulo}
                    <ArrowUpRightIcon className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Contato</h2>
            <ul className="space-y-3 text-white/75">
              {site.whatsapp && (
                <li>
                  <a
                    href={whats ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                  >
                    <WhatsappIcon className="size-4 text-[#25D366]" />
                    {formatarWhatsapp(site.whatsapp)}
                  </a>
                </li>
              )}
              <li className="inline-flex items-center gap-2.5">
                <MapPinIcon className="size-4 text-primary" /> {cidade}
              </li>
            </ul>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              © {new Date().getFullYear()} {locador.nome || "Pina's Empreendimentos"}. Todos os direitos reservados.
            </p>
            <p>Imóveis para alugar em {cidade}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
