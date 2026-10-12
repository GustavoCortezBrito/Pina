"use client";

import {
  BuildingIcon,
  ChartColumnIcon,
  FileSignatureIcon,
  HandCoinsIcon,
  HistoryIcon,
  HouseIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { AvatarFoto } from "@/components/shared/foto-perfil";
import { can, type Modulo } from "@/lib/permissions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  modulo: Modulo;
};

const GRUPOS: Array<{ label: string; items: Item[] }> = [
  {
    label: "Visão geral",
    items: [
      { href: "/", label: "Painel", icon: LayoutDashboardIcon, modulo: "contratos" },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { href: "/imoveis", label: "Imóveis", icon: HouseIcon, modulo: "imoveis" },
      {
        href: "/empreendimentos",
        label: "Empreendimentos",
        icon: BuildingIcon,
        modulo: "empreendimentos",
      },
      { href: "/pessoas", label: "Pessoas", icon: UsersIcon, modulo: "pessoas" },
    ],
  },
  {
    label: "Operação",
    items: [
      {
        href: "/contratos",
        label: "Contratos",
        icon: FileSignatureIcon,
        modulo: "contratos",
      },
      {
        href: "/financeiro/cobrancas",
        label: "Cobranças",
        icon: HandCoinsIcon,
        modulo: "cobrancas",
      },
      {
        href: "/financeiro/despesas",
        label: "Despesas e manutenção",
        icon: WalletIcon,
        modulo: "manutencoes",
      },
    ],
  },
  {
    label: "Análise",
    items: [
      {
        href: "/relatorios",
        label: "Relatórios",
        icon: ChartColumnIcon,
        modulo: "relatorios",
      },
      {
        href: "/historico",
        label: "Histórico",
        icon: HistoryIcon,
        modulo: "historico",
      },
    ],
  },
];

const CONFIGURACOES: Item = {
  href: "/configuracoes",
  label: "Configurações",
  icon: SettingsIcon,
  modulo: "configuracoes",
};

export function AppSidebar({
  role,
  nome,
  perfil,
  imagem,
}: {
  role: string;
  nome: string;
  perfil: string;
  imagem?: string | null;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const renderItem = (item: Item) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild
        isActive={isActive(item.href)}
        tooltip={item.label}
        className="group/item h-10 transition-all duration-200 hover:translate-x-0.5 data-active:bg-primary data-active:font-semibold data-active:text-primary-foreground data-active:shadow-lg data-active:shadow-primary/25 data-active:hover:translate-x-0 data-active:hover:bg-primary data-active:hover:text-primary-foreground"
      >
        <Link href={item.href} onClick={() => setOpenMobile(false)}>
          <item.icon className="text-sidebar-foreground/55 transition-all duration-200 group-hover/item:scale-110 group-hover/item:text-sidebar-accent-foreground group-data-[active=true]/menu-button:text-primary-foreground" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3 group-data-[collapsible=icon]:px-1.5">
        <Link href="/" className="flex items-center" onClick={() => setOpenMobile(false)}>
          <Logo
            showText
            className="text-sidebar-foreground [&_.text-muted-foreground]:text-sidebar-foreground/60 group-data-[collapsible=icon]:[&>span:last-child]:hidden"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-1">
        {GRUPOS.map((grupo) => ({
          ...grupo,
          items: grupo.items.filter((i) => can(role, i.modulo)),
        }))
          .filter((grupo) => grupo.items.length > 0)
          .map((grupo) => (
            <SidebarGroup key={grupo.label}>
              <SidebarGroupLabel className="text-[11px] font-semibold tracking-[0.12em] text-sidebar-foreground/45 uppercase">
                {grupo.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{grupo.items.map(renderItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        {can(role, "configuracoes") && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>{renderItem(CONFIGURACOES)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <Link
          href="/perfil"
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
        >
          <AvatarFoto
            nome={nome}
            src={imagem}
            className="size-8 shadow-md shadow-primary/30"
            fallbackClassName="bg-gradient-to-br from-primary to-brand-deep text-xs"
          />
          <span className="grid min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">{nome}</span>
            <span className="truncate text-xs text-sidebar-foreground/55">{perfil}</span>
          </span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
