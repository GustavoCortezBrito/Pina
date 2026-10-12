import type { Tone } from "@/lib/labels";

// Significado fixo das cores no sistema inteiro:
// success = verde (ok, pago, ativo) · info = azul (em andamento, informação) · warning = laranja
// da marca (atenção) · danger = vermelho (atraso, erro) · primary = laranja cheio · neutral = cinza.
export const TONE_BADGE: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  success: "bg-success/12 text-success ring-1 ring-inset ring-success/30",
  warning: "bg-primary/14 text-primary-ink ring-1 ring-inset ring-primary/35",
  danger: "bg-danger/12 text-danger ring-1 ring-inset ring-danger/30",
  info: "bg-info/12 text-info ring-1 ring-inset ring-info/30",
  primary: "bg-primary text-primary-foreground",
};

export const TONE_ICON: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/14 text-success",
  warning: "bg-primary/16 text-primary-ink",
  danger: "bg-danger/14 text-danger",
  info: "bg-info/14 text-info",
  primary: "bg-primary/16 text-primary-ink",
};

/** Card que "veste" a cor do status: faixa lateral + fundo levemente tingido. */
export const TONE_CARD: Record<Tone, string> = {
  neutral: "border-l-4 border-l-muted-foreground/30",
  success: "border-l-4 border-l-success bg-gradient-to-br from-success/[0.09] via-card via-45% to-card",
  warning: "border-l-4 border-l-primary bg-gradient-to-br from-primary/[0.12] via-card via-45% to-card",
  danger: "border-l-4 border-l-danger bg-gradient-to-br from-danger/[0.09] via-card via-45% to-card",
  info: "border-l-4 border-l-info bg-gradient-to-br from-info/[0.09] via-card via-45% to-card",
  primary: "border-l-4 border-l-primary bg-gradient-to-br from-primary/[0.12] via-card via-45% to-card",
};

export const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-foreground",
  success: "text-success",
  warning: "text-primary-ink",
  danger: "text-danger",
  info: "text-info",
  primary: "text-primary-ink",
};

/** Contorno/fundo do seletor de status, para ele também refletir a cor. */
export const TONE_FIELD: Record<Tone, string> = {
  neutral: "",
  success: "border-success/45 bg-success/10 text-success",
  warning: "border-primary/50 bg-primary/12 text-primary-ink",
  danger: "border-danger/45 bg-danger/10 text-danger",
  info: "border-info/45 bg-info/10 text-info",
  primary: "border-primary/50 bg-primary/12 text-primary-ink",
};
