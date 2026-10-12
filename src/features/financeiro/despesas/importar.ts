"use server";

import ExcelJS from "exceljs";
import { runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { detectFileType } from "@/lib/images";
import { requireAccess } from "@/lib/session";

export type ErroImportacao = { linha: number; mensagem: string };
export type ResultadoImportacao = { criadas: number; erros: ErroImportacao[] };

const MAX_LINHAS = 500;
const MAX_TAMANHO = 5 * 1024 * 1024;

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

function textoDaCelula(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  if (typeof valor === "object") {
    if ("richText" in valor) return valor.richText.map((t) => t.text).join("").trim();
    if ("result" in valor) return textoDaCelula(valor.result as ExcelJS.CellValue);
    if ("text" in valor) return String(valor.text).trim();
    return "";
  }
  return String(valor).trim();
}

function lerData(valor: ExcelJS.CellValue): Date | null {
  if (valor instanceof Date) return new Date(Date.UTC(valor.getUTCFullYear(), valor.getUTCMonth(), valor.getUTCDate()));
  const texto = textoDaCelula(valor);
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(texto);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  const [d, m, a] = br ? [+br[1], +br[2], +br[3]] : iso ? [+iso[3], +iso[2], +iso[1]] : [0, 0, 0];
  if (!a) return null;
  const data = new Date(Date.UTC(a, m - 1, d));
  return data.getUTCMonth() === m - 1 && data.getUTCDate() === d ? data : null;
}

function lerValorEmCentavos(valor: ExcelJS.CellValue): number | null {
  const bruto = typeof valor === "number" ? valor : Number(textoDaCelula(valor).replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(bruto) || bruto <= 0) return null;
  return Math.round(bruto * 100);
}

export async function importarDespesas(formData: FormData) {
  return runAction(
    async (): Promise<ResultadoImportacao> => {
      const user = await requireAccess("despesas");
      const arquivo = formData.get("arquivo");
      if (!(arquivo instanceof File)) throw new AppError("Selecione a planilha (.xlsx).");
      if (arquivo.size > MAX_TAMANHO) throw new AppError("A planilha passa de 5 MB.");

      const buffer = Buffer.from(await arquivo.arrayBuffer());
      const tipo = detectFileType(buffer, arquivo.name);
      if (tipo?.mime !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        throw new AppError("Envie uma planilha do Excel no formato .xlsx (baixe o modelo para ver o formato).");
      }

      const wb = new ExcelJS.Workbook();
      try {
        await wb.xlsx.load(buffer as unknown as ArrayBuffer);
      } catch {
        throw new AppError("Não consegui abrir a planilha. Confira se o arquivo não está corrompido.");
      }
      const ws = wb.worksheets[0];
      if (!ws) throw new AppError("A planilha está vazia.");

      const [categorias, imoveis] = await Promise.all([
        db.categoriaDespesa.findMany({ where: { ativo: true }, select: { id: true, nome: true } }),
        db.imovel.findMany({ where: { deletadoEm: null }, select: { id: true, codigo: true } }),
      ]);
      const porCategoria = new Map(categorias.map((c) => [normalizar(c.nome), c.id]));
      const porImovel = new Map(imoveis.map((i) => [normalizar(i.codigo), i.id]));

      const erros: ErroImportacao[] = [];
      const novas: Array<{
        imovelId: string | null;
        categoriaId: string;
        data: Date;
        valor: number;
        fornecedor: string | null;
        descricao: string | null;
        pago: boolean;
        criadoPorId: string;
      }> = [];

      const ultima = Math.min(ws.rowCount, MAX_LINHAS + 1);
      if (ws.rowCount > MAX_LINHAS + 1) throw new AppError(`Importe no máximo ${MAX_LINHAS} linhas por vez.`);

      for (let r = 2; r <= ultima; r++) {
        const row = ws.getRow(r);
        const c = (i: number) => row.getCell(i).value;
        if ([1, 2, 3, 4, 5, 6].every((i) => textoDaCelula(c(i)) === "")) continue;

        const problemas: string[] = [];
        const data = lerData(c(1));
        if (!data) problemas.push("data inválida (use dd/mm/aaaa)");
        const categoriaId = porCategoria.get(normalizar(textoDaCelula(c(2))));
        if (!categoriaId) problemas.push(`categoria "${textoDaCelula(c(2))}" não existe`);
        const codigo = textoDaCelula(c(3));
        const imovelId = codigo ? porImovel.get(normalizar(codigo)) : null;
        if (codigo && !imovelId) problemas.push(`imóvel "${codigo}" não encontrado`);
        const valor = lerValorEmCentavos(c(4));
        if (!valor) problemas.push("valor inválido");
        const pagoTexto = normalizar(textoDaCelula(c(7)));
        if (pagoTexto && !["sim", "nao", "s", "n"].includes(pagoTexto)) problemas.push('"Pago" deve ser Sim ou Não');

        if (problemas.length) {
          erros.push({ linha: r, mensagem: problemas.join("; ") });
          continue;
        }
        novas.push({
          imovelId: imovelId ?? null,
          categoriaId: categoriaId!,
          data: data!,
          valor: valor!,
          fornecedor: textoDaCelula(c(5)).slice(0, 150) || null,
          descricao: textoDaCelula(c(6)).slice(0, 500) || null,
          pago: !["nao", "n"].includes(pagoTexto),
          criadoPorId: user.id,
        });
      }

      if (novas.length === 0 && erros.length === 0) throw new AppError("Não encontrei nenhuma linha de despesa na planilha.");
      // Tudo ou nada: com qualquer erro, nada é gravado e o usuário corrige a planilha.
      if (erros.length > 0) return { criadas: 0, erros: erros.slice(0, 50) };

      await db.despesa.createMany({ data: novas });
      await audit({
        usuarioId: user.id,
        acao: "IMPORT",
        entidade: "Despesa",
        dados: { arquivo: arquivo.name, linhas: novas.length },
      });
      return { criadas: novas.length, erros: [] };
    },
    { revalidate: true },
  );
}
