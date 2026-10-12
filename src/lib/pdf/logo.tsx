import { Circle, Path, Svg, Text, View } from "@react-pdf/renderer";

const LARANJA = "#E8862F";

/** Símbolo da marca (círculo com "P") desenhado em vetor, nítido em qualquer zoom. */
export function LogoMarkPdf({ size = 34 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={28} stroke={LARANJA} strokeWidth={4.5} fill="none" />
      <Path d="M22 48.5V16h12.5a8.75 8.75 0 0 1 0 17.5H28" stroke={LARANJA} strokeWidth={5} fill="none" />
      <Path d="M31.5 42V24h3.75a4.5 4.5 0 0 1 0 9h-2.5" stroke={LARANJA} strokeWidth={2.75} fill="none" />
    </Svg>
  );
}

/** Logo completo (símbolo + nome) para o cabeçalho dos documentos. */
export function LogoPdf({ size = 34 }: { size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <LogoMarkPdf size={size} />
      <View style={{ marginLeft: 8 }}>
        <Text style={{ fontSize: size * 0.47, fontWeight: 700, color: "#1a1613", letterSpacing: 1 }}>PINA&apos;S</Text>
        <Text style={{ fontSize: size * 0.2, color: "#b8520c", letterSpacing: 1.6, marginTop: 1 }}>EMPREENDIMENTOS</Text>
      </View>
    </View>
  );
}
