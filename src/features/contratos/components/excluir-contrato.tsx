"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { Button } from "@/components/ui/button";
import { excluirContrato } from "@/features/contratos/actions";

export function ExcluirContrato({
  contratoId,
  numero,
  ativo,
  pagamentos,
}: {
  contratoId: string;
  numero: string;
  ativo: boolean;
  /** Quantos pagamentos já recebidos serão apagados junto. */
  pagamentos: number;
}) {
  const router = useRouter();

  return (
    <ConfirmAction
      trigger={
        <Button variant="outline" className="text-destructive hover:text-destructive">
          <Trash2Icon /> Excluir
        </Button>
      }
      titulo={`Excluir o contrato nº ${numero}?`}
      descricao={
        <>
          Serão apagados o contrato, as cobranças, os arquivos e os documentos dele.
          {pagamentos > 0 && (
            <>
              {" "}
              <strong className="text-foreground">
                {pagamentos === 1 ? "1 pagamento recebido" : `${pagamentos} pagamentos recebidos`} também
                sairá do financeiro e dos relatórios.
              </strong>
            </>
          )}
          {ativo && " Como o contrato está ativo, o imóvel volta a ficar disponível."} Esta ação não pode ser
          desfeita. Para apenas encerrar o contrato mantendo o histórico, use &quot;Encerrar&quot;.
        </>
      }
      confirmLabel="Excluir contrato"
      action={() => excluirContrato(contratoId)}
      onDone={() => router.push("/contratos")}
    />
  );
}
