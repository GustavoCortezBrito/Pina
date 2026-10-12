import { MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { linkWhatsapp } from "@/features/vitrine/whatsapp";
import { getSettings } from "@/lib/settings";

export default async function VitrineLayout({ children }: { children: React.ReactNode }) {
  const { site, locador } = await getSettings();
  const whats = linkWhatsapp(site.whatsapp);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
          <Link href="/vitrine" aria-label="Pina's Empreendimentos — início">
            <Logo className="[&>span:last-child]:hidden min-[400px]:[&>span:last-child]:grid" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {whats && (
              <Button
                asChild
                className="bg-[#25D366] text-white shadow-[#25D366]/30 hover:bg-[#1fb857] hover:brightness-100"
              >
                <a href={whats} target="_blank" rel="noreferrer">
                  <MessageCircleIcon /> <span className="hidden sm:inline">Falar no WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </a>
              </Button>
            )}
          </div>
        </div>
        <span aria-hidden className="block h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </header>

      <div className="flex-1">{children}</div>

      <footer className="surface-brand mt-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Logo className="text-white [&_.text-muted-foreground]:text-white/60" />
            <p className="pt-2 text-sm text-white/60">{locador.cidade || "Barretos/SP"}</p>
          </div>
          {whats && (
            <a
              href={whats}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <MessageCircleIcon className="size-4" /> Fale com a gente pelo WhatsApp
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
