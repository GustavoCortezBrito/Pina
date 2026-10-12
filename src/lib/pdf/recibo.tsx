import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { LogoPdf } from "./logo";
import { formatDate, formatDateLong } from "@/lib/dates";
import { formatDocumento } from "@/lib/format";
import { valorPorExtenso } from "@/lib/extenso";
import { formatBRL } from "@/lib/money";
import type { Locador } from "@/features/configuracoes/schemas";

const styles = StyleSheet.create({
  page: { padding: 56, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.5 },
  header: { marginBottom: 28, borderBottom: "2 solid #e8792b", paddingBottom: 12 },
  brand: { fontSize: 16, fontWeight: 700, color: "#b8520c" },
  brandSub: { fontSize: 9, color: "#666", marginTop: 2 },
  title: { fontSize: 14, fontWeight: 700, textAlign: "center", marginVertical: 20, letterSpacing: 1 },
  numero: { fontSize: 10, color: "#666", textAlign: "center", marginTop: -14, marginBottom: 20 },
  valor: { fontSize: 22, fontWeight: 700, textAlign: "center", marginVertical: 16 },
  paragraph: { marginBottom: 14, textAlign: "justify" },
  table: { marginTop: 20, borderTop: "1 solid #ddd" },
  row: { flexDirection: "row", borderBottom: "1 solid #ddd", paddingVertical: 7 },
  label: { width: 140, color: "#666" },
  value: { flex: 1, fontWeight: 700 },
  footer: { marginTop: 48 },
  signatureLine: { marginTop: 56, borderTop: "1 solid #1a1a1a", width: 260, alignSelf: "center", paddingTop: 6 },
  signatureLabel: { textAlign: "center", fontSize: 9, color: "#666" },
});

export type ReciboData = {
  numero: string;
  locador: Locador;
  locatarioNome: string;
  locatarioDocumento: string;
  imovelTitulo: string;
  imovelEndereco: string;
  competencia: Date;
  dataPagamento: Date;
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  valorPago: number;
  forma: string;
};

const FORMA_LABEL: Record<string, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  TRANSFERENCIA: "Transferência bancária",
  BOLETO: "Boleto",
  CARTAO: "Cartão",
  OUTRO: "Outro",
};

export function ReciboDocument({ data }: { data: ReciboData }) {
  const competenciaFmt = data.competencia.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <Document title={`Recibo ${data.numero}`} author={data.locador.nome || "PinaSystem"}>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <LogoPdf size={38} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.brand}>{data.locador.nome || "Locador"}</Text>
            {data.locador.documento && (
              <Text style={styles.brandSub}>{formatDocumento(data.locador.documento)}</Text>
            )}
          </View>
        </View>

        <Text style={styles.title}>RECIBO DE ALUGUEL</Text>
        <Text style={styles.numero}>Nº {data.numero}</Text>

        <Text style={styles.valor}>{formatBRL(data.valorPago)}</Text>

        <Text style={styles.paragraph}>
          Recebi de <Text style={{ fontWeight: 700 }}>{data.locatarioNome}</Text>
          {data.locatarioDocumento ? `, CPF/CNPJ ${formatDocumento(data.locatarioDocumento)},` : ","} a
          quantia de {formatBRL(data.valorPago)} ({valorPorExtenso(data.valorPago)}), referente ao aluguel
          e encargos do imóvel {data.imovelTitulo}, situado em {data.imovelEndereco}, competência de{" "}
          {competenciaFmt}.
        </Text>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.label}>Valor do aluguel</Text>
            <Text style={styles.value}>{formatBRL(data.valorPrincipal)}</Text>
          </View>
          {(data.valorMulta > 0 || data.valorJuros > 0) && (
            <View style={styles.row}>
              <Text style={styles.label}>Multa e juros</Text>
              <Text style={styles.value}>{formatBRL(data.valorMulta + data.valorJuros)}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Forma de pagamento</Text>
            <Text style={styles.value}>{FORMA_LABEL[data.forma] ?? data.forma}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data do pagamento</Text>
            <Text style={styles.value}>{formatDate(data.dataPagamento)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={{ textAlign: "center" }}>
            {data.locador.cidade || "Barretos/SP"}, {formatDateLong(data.dataPagamento)}.
          </Text>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>{data.locador.nome || "Locador"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
