import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasDespesa } from "@/features/configuracoes/components/categorias-despesa";
import { FinanceiroForm } from "@/features/configuracoes/components/financeiro-form";
import { LocadorForm } from "@/features/configuracoes/components/locador-form";
import { ModelosContrato } from "@/features/configuracoes/components/modelos-contrato";
import { UsuariosGestao } from "@/features/usuarios/components/usuarios-gestao";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const eu = await requireAdminPage();

  const [settings, categorias, modelos, usuarios] = await Promise.all([
    getSettings(),
    db.categoriaDespesa.findMany({ orderBy: { nome: "asc" } }),
    db.modeloContrato.findMany({
      orderBy: { nome: "asc" },
      include: { arquivos: { select: { id: true, nomeOriginal: true }, take: 1 } },
    }),
    db.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true, banned: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados do locador, parâmetros financeiros e modelos."
      />

      <Tabs defaultValue="locador">
        <TabsList>
          <TabsTrigger value="locador">Locador</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="modelos">Modelos de contrato</TabsTrigger>
          <TabsTrigger value="categorias">Categorias de despesa</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários e acessos</TabsTrigger>
        </TabsList>

        <TabsContent value="locador">
          <Card>
            <CardContent>
              <LocadorForm valores={settings.locador} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro">
          <Card>
            <CardContent>
              <FinanceiroForm valores={settings.financeiro} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modelos">
          <ModelosContrato modelos={modelos} />
        </TabsContent>

        <TabsContent value="categorias">
          <CategoriasDespesa categorias={categorias} />
        </TabsContent>

        <TabsContent value="usuarios">
          <UsuariosGestao usuarios={usuarios} meuId={eu.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
