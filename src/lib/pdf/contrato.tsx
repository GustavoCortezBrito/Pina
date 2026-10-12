import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { LogoPdf } from "@/lib/pdf/logo";
import { MarkdownPdf } from "@/lib/pdf/markdown";

const styles = StyleSheet.create({
  page: { padding: 56, paddingBottom: 72, fontSize: 10.5, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.5 },
  header: { marginBottom: 20, borderBottom: "2 solid #e8792b", paddingBottom: 10 },
  brand: { fontSize: 13, fontWeight: 700, color: "#b8520c" },
  brandSub: { fontSize: 8, color: "#666", marginTop: 2 },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});

export function ContratoDocument({
  titulo,
  locadorNome,
  conteudo,
}: {
  titulo: string;
  locadorNome: string;
  conteudo: string;
}) {
  return (
    <Document title={titulo} author={locadorNome || "PinaSystem"}>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]} fixed>
          <LogoPdf size={30} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.brand}>{locadorNome || "Contrato de Locação"}</Text>
            <Text style={styles.brandSub}>{titulo}</Text>
          </View>
        </View>

        <MarkdownPdf texto={conteudo} />

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
