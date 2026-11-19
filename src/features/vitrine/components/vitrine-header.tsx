"use client";

import { LayoutDashboardIcon, LockKeyholeIcon, MenuIcon, XIcon } from "lucide-react";
import { AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EASE } from "./animacao";
import { WhatsappIcon } from "./whatsapp-icon";

const LINKS = [
  { href: "/#imoveis", rotulo: "Imóveis" },
  { href: "/#como-funciona", rotulo: "Como funciona" },
  { href: "/#contato", rotulo: "Contato" },
];

/**
 * Na página inicial o cabeçalho fica transparente sobre a foto do topo e ganha fundo ao rolar;
 * nas demais já começa sólido. Some ao rolar para baixo e volta ao rolar para cima. O ícone do
 * canto leva ao login (ou direto ao painel, se a pessoa já estiver logada).
 */
export function VitrineHeader({ whats, logado }: { whats: string | null; logado: boolean }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [rolou, setRolou] = React.useState(false);
  const [escondido, setEscondido] = React.useState(false);
  // O menu guarda em qual página foi aberto: ao trocar de página ele se fecha sozinho.
  const [menuEm, setMenuEm] = React.useState<string | null>(null);
  const menuAberto = menuEm === pathname;

  useMotionValueEvent(scrollY, "change", (atual) => {
    const anterior = scrollY.getPrevious() ?? 0;
    setRolou(atual > 24);
    if (atual < 160) setEscondido(false);
    else if (atual > anterior + 4) setEscondido(true);
    else if (atual < anterior - 4) setEscondido(false);
  });

  React.useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setMenuEm(null);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  const transparente = pathname === "/" && !rolou && !menuAberto;
  const AcessoIcon = logado ? LayoutDashboardIcon : LockKeyholeIcon;
  const acessoRotulo = logado ? "Abrir o painel" : "Acesso da equipe";

  return (
    <m.header
      animate={{ y: escondido && !menuAberto ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-500",
        transparente
          ? "border-b border-transparent bg-transparent text-white"
          : "border-b bg-background/80 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl backdrop-saturate-150",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Pina's Empreendimentos — início"
          className="shrink-0 transition-opacity hover:opacity-85"
        >
          <Logo
            className={cn(
              "[&>span:last-child]:hidden min-[420px]:[&>span:last-child]:grid [&_svg]:size-9",
              transparente && "[&_.text-muted-foreground]:text-white/65",
            )}
          />
        </Link>

        <nav aria-label="Seções" className="ml-8 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                "after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100",
                transparente ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.rotulo}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {whats && (
            <a
              href={whats}
              target="_blank"
              rel="noreferrer"
              id="header-whatsapp"
              className="btn-whatsapp inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all hover:-translate-y-0.5 sm:px-5"
            >
              <WhatsappIcon className="size-4.5" />
              <span className="hidden sm:inline">Falar no WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={logado ? "/painel" : "/login"}
                id="header-acesso"
                aria-label={acessoRotulo}
                className={cn(
                  "hidden size-11 items-center justify-center rounded-full border transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary-ink md:flex",
                  transparente ? "border-white/25 bg-white/10 text-white backdrop-blur-md hover:text-white" : "bg-card",
                )}
              >
                <AcessoIcon className="size-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>{acessoRotulo}</TooltipContent>
          </Tooltip>

          <button
            type="button"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            onClick={() => setMenuEm(menuAberto ? null : pathname)}
            className={cn(
              "flex size-11 items-center justify-center rounded-full border transition-colors md:hidden",
              transparente ? "border-white/25 bg-white/10 text-white backdrop-blur-md" : "bg-card",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={menuAberto ? "fechar" : "abrir"}
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {menuAberto ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
              </m.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuAberto && (
          <m.div
            key="menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden border-t bg-background/95 text-foreground backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Menu" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {[...LINKS, { href: logado ? "/painel" : "/login", rotulo: acessoRotulo }].map((l, i) => (
                <m.div
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.05, duration: 0.4, ease: EASE }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMenuEm(null)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium transition-colors hover:bg-muted"
                  >
                    {l.rotulo}
                    {l.href === "/login" || l.href === "/painel" ? (
                      <AcessoIcon className="size-5 text-primary-ink" />
                    ) : null}
                  </Link>
                </m.div>
              ))}
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
