import ExcelJS from "exceljs";
import sharp from "sharp";
import type { Celula, Relatorio } from "./definicoes";

const LARANJA = "FFE8862F";
const PRETO = "FF1A1613";

function valorCelula(valor: Celula, tipo: string) {
  if (valor === null || valor === undefined) return null;
  if (tipo === "moeda" && typeof valor === "number") return valor / 100;
  if (valor instanceof Date) return new Date(valor.getUTCFullYear(), valor.getUTCMonth(), valor.getUTCDate());
  return valor;
}

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256" fill="none"><circle cx="32" cy="32" r="28" stroke="#E8862F" stroke-width="4.5"/><path d="M22 48.5V16h12.5a8.75 8.75 0 0 1 0 17.5H28" stroke="#E8862F" stroke-width="5"/><path d="M31.5 42V24h3.75a4.5 4.5 0 0 1 0 9h-2.5" stroke="#E8862F" stroke-width="2.75"/></svg>`;

export async function gerarExcel(relatorio: Relatorio): Promise<Buffer> {
  const logoPng = await sharp(Buffer.from(LOGO_SVG)).png().toBuffer();
  const wb = new ExcelJS.Workbook();
  const logoId = wb.addImage({ buffer: logoPng as unknown as ExcelJS.Buffer, extension: "png" });
  wb.creator = "PinaSystem";
  wb.created = new Date();

  relatorio.tabelas.forEach((tabela, indice) => {
    const nomeAba = (tabela.titulo ?? relatorio.titulo).replace(/[\\/*?:[\]]/g, " ").slice(0, 31);
    const ws = wb.addWorksheet(nomeAba || `Tabela ${indice + 1}`, { views: [{ state: "frozen", ySplit: 3 }] });
    const ultimaColuna = tabela.colunas.length;

    ws.getRow(1).height = 26;
    ws.getRow(2).height = 22;
    ws.addImage(logoId, { tl: { col: 0.12, row: 0.08 }, ext: { width: 46, height: 46 } });
    ws.mergeCells(1, 2, 1, Math.max(ultimaColuna, 2));
    const titulo = ws.getCell(1, 2);
    titulo.value = `${relatorio.titulo}${tabela.titulo ? ` — ${tabela.titulo}` : ""}`;
    titulo.font = { bold: true, size: 14, color: { argb: PRETO } };
    ws.mergeCells(2, 2, 2, Math.max(ultimaColuna, 2));
    ws.getCell(2, 2).value = `${relatorio.subtitulo} · gerado em ${new Date().toLocaleDateString("pt-BR")}`;
    ws.getCell(2, 2).font = { italic: true, color: { argb: "FF6B6259" } };

    const cabecalho = ws.getRow(3);
    tabela.colunas.forEach((coluna, i) => {
      const celula = cabecalho.getCell(i + 1);
      celula.value = coluna.titulo;
      celula.font = { bold: true, color: { argb: "FFFFFFFF" } };
      celula.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRETO } };
      celula.alignment = { vertical: "middle", horizontal: coluna.tipo === "moeda" || coluna.tipo === "numero" ? "right" : "left" };
      ws.getColumn(i + 1).width = coluna.largura ?? 18;
    });
    cabecalho.height = 22;
    cabecalho.getCell(1).border = { left: { style: "thick", color: { argb: LARANJA } } };

    tabela.linhas.forEach((linha, r) => {
      const row = ws.getRow(4 + r);
      tabela.colunas.forEach((coluna, i) => {
        const celula = row.getCell(i + 1);
        celula.value = valorCelula(linha[coluna.chave] ?? null, coluna.tipo);
        if (coluna.tipo === "moeda") celula.numFmt = '"R$" #,##0.00';
        if (coluna.tipo === "data") celula.numFmt = "dd/mm/yyyy";
        if (coluna.tipo === "moeda" || coluna.tipo === "numero") celula.alignment = { horizontal: "right" };
      });
      if (r % 2 === 1) row.eachCell((c) => (c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F3EE" } }));
    });

    if (tabela.somar?.length && tabela.linhas.length) {
      const primeira = 4;
      const ultima = 3 + tabela.linhas.length;
      const rowTotal = ws.getRow(ultima + 1);
      rowTotal.getCell(1).value = "Total";
      tabela.colunas.forEach((coluna, i) => {
        if (!tabela.somar?.includes(coluna.chave)) return;
        const letra = ws.getColumn(i + 1).letter;
        const celula = rowTotal.getCell(i + 1);
        celula.value = { formula: `SUM(${letra}${primeira}:${letra}${ultima})` };
        celula.numFmt = coluna.tipo === "moeda" ? '"R$" #,##0.00' : "0";
        celula.alignment = { horizontal: "right" };
      });
      rowTotal.eachCell({ includeEmpty: true }, (c) => {
        c.font = { bold: true };
        c.border = { top: { style: "medium", color: { argb: LARANJA } } };
      });
    }

    ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + Math.max(tabela.linhas.length, 1), column: ultimaColuna } };
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
