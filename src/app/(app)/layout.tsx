import { GlobeIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { RouteTransition } from "@/components/layout/route-transition";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ROLE_LABEL, normalizeRole } from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const perfil = ROLE_LABEL[normalizeRole(user.role)];

  return (
    <SidebarProvider>
      <AppSidebar role={user.role ?? "operador"} nome={user.name} perfil={perfil} imagem={user.image} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md md:px-4">
          <SidebarTrigger className="size-10" />
          <Link href="/" className="md:hidden" aria-label="Início">
            <Logo showText className="[&>span:last-child]:hidden min-[380px]:[&>span:last-child]:grid" />
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="text-primary-ink">
              <a href="/vitrine" target="_blank" rel="noreferrer" title="Abrir a vitrine pública de imóveis">
                <GlobeIcon /> <span className="hidden sm:inline">Ver site</span>
              </a>
            </Button>
            <ThemeToggle />
            <UserMenu nome={user.name} email={user.email} perfil={perfil} imagem={user.image} />
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          />
        </header>
        <main className="mx-auto w-full max-w-[1500px] min-w-0 flex-1 p-4 pb-10 md:p-6 md:pb-12">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
