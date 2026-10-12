/** Link do WhatsApp com a mensagem já preenchida sobre o imóvel. */
export function linkWhatsapp(numero: string, imovel?: { titulo: string; codigo: string }) {
  const digitos = numero.replace(/\D/g, "");
  if (!digitos) return null;
  const texto = imovel
    ? `Olá! Vi o imóvel "${imovel.titulo}" (cód. ${imovel.codigo}) no site da Pina's Empreendimentos e gostaria de mais informações.`
    : "Olá! Vi o site da Pina's Empreendimentos e gostaria de mais informações sobre os imóveis.";
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}

export function formatarWhatsapp(numero: string) {
  const d = numero.replace(/\D/g, "").replace(/^55/, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : numero;
}
