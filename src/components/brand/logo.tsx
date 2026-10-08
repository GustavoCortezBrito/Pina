import { cn } from "@/lib/utils";

/**
 * Reconstrução do símbolo da marca (círculo com "P" geométrico).
 * Quando o arquivo vetorial oficial chegar, basta trocar este SVG.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-8 text-brand", className)}
    >
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4.5" />
      <path d="M22 48.5V16h12.5a8.75 8.75 0 0 1 0 17.5H28" stroke="currentColor" strokeWidth="5" />
      <path d="M31.5 42V24h3.75a4.5 4.5 0 0 1 0 9h-2.5" stroke="currentColor" strokeWidth="2.75" />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {showText && (
        <span className="grid leading-none">
          <span className="text-base font-bold tracking-wide">PINA&apos;S</span>
          <span className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
            EMPREENDIMENTOS
          </span>
        </span>
      )}
    </span>
  );
}
