import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse("Não autorizado", { status: 401 });
  if (!can(session.user.role, "despesas")) return new NextResponse("Sem permissão", { status: 403 });

  const [categorias, imoveis] = await Promise.all([
    db.categoriaDespesa.findMany({ where: { ativo: true }, orderBy: { nome: "asc" }, select: { nome: true } }),
    db.imovel.findMany({ where: { deletadoEm: null }, orderBy: { codigo: "asc" }, select: { codigo: true, titulo: true } }),
  ]);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Despesas");
  ws.columns = [
    { header: "Data", width: 14 },
    { header: "Categoria", width: 22 },
    { header: "Imóvel (código)", width: 18 },
    { header: "Valor (R$)", width: 14 },
    { header: "Fornecedor", width: 26 },
    { header: "Descrição", width: 34 },
    { header: "Pago (Sim/Não)", width: 16 },
  ];
  const cab = ws.getRow(1);
  cab.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1613" } };
  });
  ws.addRow([new Date(), categorias[0]?.nome ?? "Manutenção", imoveis[0]?.codigo ?? "", 320.5, "Exemplo Ltda", "Linha de exemplo — apague antes de importar", "Sim"]);
  ws.getColumn(1).numFmt = "dd/mm/yyyy";
  ws.getColumn(4).numFmt = '"R$" #,##0.00';
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const ref = wb.addWorksheet("Categorias e imóveis");
  ref.columns = [
    { header: "Categorias válidas", width: 28 },
    { header: "Códigos de imóvel", width: 20 },
    { header: "Imóvel", width: 36 },
  ];
  ref.getRow(1).font = { bold: true };
  const linhas = Math.max(categorias.length, imoveis.length);
  for (let i = 0; i < linhas; i++) ref.addRow([categorias[i]?.nome ?? "", imoveis[i]?.codigo ?? "", imoveis[i]?.titulo ?? ""]);

  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modelo-importacao-despesas.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
