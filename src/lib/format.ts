import { normalizeDocumento, onlyDigits } from "@/lib/validators";

export function formatCPF(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function formatCNPJ(value: string): string {
  const d = normalizeDocumento(value).slice(0, 14);
  return d
    .replace(/^(\w{2})(\w)/, "$1.$2")
    .replace(/^(\w{2})\.(\w{3})(\w)/, "$1.$2.$3")
    .replace(/\.(\w{3})(\w)/, ".$1/$2")
    .replace(/(\w{4})(\w)/, "$1-$2");
}

export function formatDocumento(value: string | null | undefined): string {
  const d = normalizeDocumento(value);
  if (!d) return "—";
  return d.length > 11 || /[A-Z]/.test(d) ? formatCNPJ(d) : formatCPF(d);
}

export function formatPhone(value: string | null | undefined): string {
  const d = onlyDigits(value).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatCEP(value: string | null | undefined): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Link para abrir conversa no WhatsApp (assume Brasil se não houver DDI). */
export function whatsappLink(phone: string | null | undefined, text?: string): string | null {
  const d = onlyDigits(phone);
  if (d.length < 10) return null;
  const number = d.length <= 11 ? `55${d}` : d;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${number}${query}`;
}

type Endereco = {
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
};

export function formatEndereco(e: Endereco, options: { cep?: boolean } = {}): string {
  const rua = [e.logradouro, e.numero].filter(Boolean).join(", ");
  const parts = [rua, e.complemento, e.bairro].filter(Boolean);
  const cidade = [e.cidade, e.uf].filter(Boolean).join("/");
  if (cidade) parts.push(cidade);
  if (options.cep && e.cep) parts.push(`CEP ${formatCEP(e.cep)}`);
  return parts.join(" – ") || "—";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}%`;
}

export function formatNumeroContrato(numero: number): string {
  return String(numero).padStart(4, "0");
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
