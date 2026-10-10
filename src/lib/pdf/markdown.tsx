import { Text, View } from "@react-pdf/renderer";

/**
 * Renderizador leve para o texto dos modelos de contrato: linhas iniciadas com
 * "# " e "## " viram títulos, blocos separados por linha em branco viram
 * parágrafos, e `**negrito**` vira texto em negrito. Suficiente para os
 * modelos cadastrados em Configurações, sem depender de uma lib de markdown.
 */
export function MarkdownPdf({ texto }: { texto: string }) {
  const blocos = texto.trim().split(/\n{2,}/);

  return (
    <>
      {blocos.map((bloco, blocoIndex) => (
        <View key={blocoIndex} style={{ marginBottom: 12 }}>
          {bloco.split("\n").map((linha, linhaIndex) => renderLinha(linha, `${blocoIndex}-${linhaIndex}`))}
        </View>
      ))}
    </>
  );
}

function renderLinha(linha: string, key: string) {
  if (linha.startsWith("## ")) {
    return (
      <Text key={key} style={{ fontSize: 12, fontWeight: 700, marginTop: 10, marginBottom: 4 }}>
        {linha.slice(3)}
      </Text>
    );
  }
  if (linha.startsWith("# ")) {
    return (
      <Text key={key} style={{ fontSize: 15, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>
        {linha.slice(2)}
      </Text>
    );
  }
  if (/^_+$/.test(linha.trim())) {
    return (
      <Text key={key} style={{ marginTop: 18 }}>
        {linha}
      </Text>
    );
  }
  return (
    <Text key={key} style={{ textAlign: "justify", marginBottom: 2 }}>
      {renderInline(linha)}
    </Text>
  );
}

function renderInline(linha: string) {
  const partes = linha.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return partes.map((parte, index) =>
    parte.startsWith("**") && parte.endsWith("**") ? (
      <Text key={index} style={{ fontWeight: 700 }}>
        {parte.slice(2, -2)}
      </Text>
    ) : (
      <Text key={index}>{parte}</Text>
    ),
  );
}
