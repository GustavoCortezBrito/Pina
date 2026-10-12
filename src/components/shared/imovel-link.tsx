import Link from "next/link";
import { cn } from "@/lib/utils";

/** Nome/código do imóvel que leva à página dele. Funciona também dentro de cards clicáveis. */
export function ImovelLink({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={`/imoveis/${id}`}
      title="Abrir o imóvel"
      className={cn(
        "pointer-events-auto relative underline-offset-4 hover:text-primary-ink hover:underline",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Link que cobre o card inteiro; o conteúdo do card fica por cima, deixando só os links internos clicáveis. */
export function CardOverlayLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} aria-label={label} className="absolute inset-0 z-0 rounded-xl" />;
}
