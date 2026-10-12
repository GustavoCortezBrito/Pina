import { redirect } from "next/navigation";

// As manutenções agora ficam dentro de Despesas (aba "Manutenções"); links antigos continuam funcionando.
export default function ManutencoesPage() {
  redirect("/financeiro/despesas?aba=manutencoes");
}
