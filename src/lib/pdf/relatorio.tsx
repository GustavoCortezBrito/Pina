import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Celula, Coluna, Relatorio, Tabela } from "@/features/relatorios/export/definicoes";
import { formatDate } from "@/lib/dates";
import { LogoPdf } from "./logo";
import { formatBRL } from "@/lib/money";

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { marginBottom: 14, borderBottom: "2 solid #e8862f", paddingBottom: 8 },
  brand: { fontSize: 9, color: "#b8520c", fontWeight: 700, letterSpacing: 1 },
  title: { fontSize: 17, fontWeight: 700, marginTop: 2 },
  sub: { fontSize: 9, color: "#666", marginTop: 2 },
  tabelaTitulo: { fontSize: 11, fontWeight: 700, marginTop: 14, marginBottom: 6 },
  head: { flexDirection: "row", backgroundColor: "#1a1613", color: "#fff", paddingVertical: 5, paddingHorizontal: 4 },
  row: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: "0.5 solid #e5e0d9" },
  rowAlt: { backgroundColor: "#faf7f3" },
  total: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 4, borderTop: "1.5 solid #e8862f", fontWeight: 700 },
  footer: { position: "absolute", bottom: 18, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#888" },
});

function texto(valor: Celula, tipo: Coluna["tipo"]): string {
  if (valor === null || valor === undefined || valor === "") return "";
  if (tipo === "moeda" && typeof valor === "number") return formatBRL(valor);
  if (valor instanceof Date) return formatDate(valor);
  return String(valor);
}

function larguras(colunas: Coluna[]) {
  const total = colunas.reduce((soma, c) => soma + (c.largura ?? 18), 0);
  return colunas.map((c) => `${((c.largura ?? 18) / total) * 100}%`);
}

function TabelaPdf({ tabela }: { tabela: Tabela }) {
  const w = larguras(tabela.colunas);
  const alinhar = (c: Coluna) => (c.tipo === "moeda" || c.tipo === "numero" ? "right" : "left");
  return (
    <View>
      {tabela.titulo && <Text style={s.tabelaTitulo}>{tabela.titulo}</Text>}
      <View style={s.head} fixed>
        {tabela.colunas.map((c, i) => (
          <Text key={c.chave} style={{ width: w[i], textAlign: alinhar(c), fontWeight: 700, paddingRight: 6 }}>
            {c.titulo}
          </Text>
        ))}
      </View>
      {tabela.linhas.map((linha, r) => (
        <View key={r} style={[s.row, r % 2 === 1 ? s.rowAlt : {}]} wrap={false}>
          {tabela.colunas.map((c, i) => (
            <Text key={c.chave} style={{ width: w[i], textAlign: alinhar(c), paddingRight: 6 }}>
              {texto(linha[c.chave] ?? null, c.tipo)}
            </Text>
          ))}
        </View>
      ))}
      {tabela.linhas.length === 0 && <Text style={{ marginTop: 8, color: "#888" }}>Nenhum registro no período.</Text>}
      {tabela.somar?.length && tabela.linhas.length > 0 ? (
        <View style={s.total}>
          {tabela.colunas.map((c, i) => {
            const soma = tabela.somar?.includes(c.chave)
              ? tabela.linhas.reduce((acc, l) => acc + (typeof l[c.chave] === "number" ? (l[c.chave] as number) : 0), 0)
              : null;
            return (
              <Text key={c.chave} style={{ width: w[i], textAlign: alinhar(c), fontWeight: 700, paddingRight: 6 }}>
                {i === 0 ? "Total" : soma !== null ? texto(soma, c.tipo) : ""}
              </Text>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export function RelatorioDocument({ relatorio }: { relatorio: Relatorio }) {
  return (
    <Document title={relatorio.titulo} author="PinaSystem">
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={[s.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <View>
            <Text style={s.title}>{relatorio.titulo}</Text>
            <Text style={s.sub}>
              {relatorio.subtitulo} · gerado em {new Date().toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <LogoPdf size={36} />
        </View>
        {relatorio.tabelas.map((tabela, i) => (
          <TabelaPdf key={i} tabela={tabela} />
        ))}
        <View style={s.footer} fixed>
          <Text>PinaSystem</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
