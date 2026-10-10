import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { RouteTransition } from "@/components/layout/route-transition";
import { UserMenu } from "@/components/layout/user-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { isAdmin, requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const admin = isAdmin(user);

  return (
    <SidebarProvider>
      <AppSidebar isAdmin={admin} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 !h-5 md:hidden" />
          <Link href="/" className="md:hidden">
            <Logo showText={false} />
          </Link>
          <div className="ml-auto">
            <UserMenu
              nome={user.name}
              email={user.email}
              perfil={admin ? "Administrador" : "Operador"}
            />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] min-w-0 flex-1 p-4 md:p-6">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
