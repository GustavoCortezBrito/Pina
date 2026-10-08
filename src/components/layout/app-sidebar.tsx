"use client";

import {
  BuildingIcon,
  ChartColumnIcon,
  FileSignatureIcon,
  HandCoinsIcon,
  HouseIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const GRUPOS: Array<{ label: string; items: Item[] }> = [
  {
    label: "Visão geral",
    items: [{ href: "/", label: "Painel", icon: LayoutDashboardIcon }],
  },
  {
    label: "Cadastros",
    items: [
      { href: "/imoveis", label: "Imóveis", icon: HouseIcon },
      { href: "/empreendimentos", label: "Empreendimentos", icon: BuildingIcon },
      { href: "/pessoas", label: "Pessoas", icon: UsersIcon },
    ],
  },
  {
    label: "Operação",
    items: [
      { href: "/contratos", label: "Contratos", icon: FileSignatureIcon },
      { href: "/financeiro/cobrancas", label: "Cobranças", icon: HandCoinsIcon },
      { href: "/financeiro/despesas", label: "Despesas", icon: WalletIcon },
      { href: "/manutencoes", label: "Manutenções", icon: WrenchIcon },
    ],
  },
  {
    label: "Análise",
    items: [{ href: "/relatorios", label: "Relatórios", icon: ChartColumnIcon }],
  },
];

const CONFIGURACOES: Item = { href: "/configuracoes", label: "Configurações", icon: SettingsIcon };

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const renderItem = (item: Item) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
        <Link href={item.href} onClick={() => setOpenMobile(false)}>
          <item.icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b px-3 group-data-[collapsible=icon]:px-1.5">
        <Link href="/" className="flex items-center" onClick={() => setOpenMobile(false)}>
          <Logo showText className="group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {GRUPOS.map((grupo) => (
          <SidebarGroup key={grupo.label}>
            <SidebarGroupLabel>{grupo.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{grupo.items.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {isAdmin && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>{renderItem(CONFIGURACOES)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
