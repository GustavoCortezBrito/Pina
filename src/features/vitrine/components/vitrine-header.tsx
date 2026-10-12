"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { WhatsappIcon } from "./whatsapp-icon";

const LINKS = [
  { href: "/vitrine#imoveis", rotulo: "Imóveis" },
  { href: "/vitrine#como-funciona", rotulo: "Como funciona" },
  { href: "#contato", rotulo: "Contato" },
];

/**
 * Na página inicial o cabeçalho fica transparente sobre a foto do topo e ganha fundo
 * ao rolar. Nas demais páginas já começa sólido.
 */
export function VitrineHeader({ whats }: { whats: string | null }) {
  const pathname = usePathname();
  const [rolou, setRolou] = React.useState(false);

  React.useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  const transparente = pathname === "/vitrine" && !rolou;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-500",
        transparente
          ? "border-b border-transparent bg-transparent text-white"
          : "border-b bg-background/75 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl backdrop-saturate-150",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/vitrine"
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
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                "after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100",
                transparente ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.rotulo}
            </a>
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
        </div>
      </div>
    </header>
  );
}
