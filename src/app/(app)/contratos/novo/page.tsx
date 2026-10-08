import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ContratoWizard } from "@/features/contratos/components/contrato-wizard";
import { opcoesImoveis } from "@/features/imoveis/queries";
import { opcoesPessoas } from "@/features/pessoas/queries";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Novo contrato" };

export default async function NovoContratoPage() {
  const [imoveis, inquilinos, fiadores, settings] = await Promise.all([
    opcoesImoveis(true),
    opcoesPessoas("INQUILINO"),
    opcoesPessoas("FIADOR"),
    getSettings(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Novo contrato" description="Preencha as etapas para montar o contrato." />
      <ContratoWizard
        imoveis={imoveis}
        inquilinos={inquilinos}
        fiadores={fiadores}
        padroes={{
          prazoMeses: settings.financeiro.prazoPadraoMeses,
          diaVencimento: settings.financeiro.diaVencimento,
          indiceReajuste: settings.financeiro.indiceReajuste,
          aluguelAntecipado: settings.financeiro.aluguelAntecipado,
        }}
      />
    </div>
  );
}
