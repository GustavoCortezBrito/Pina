import { VoltarButton } from "@/components/shared/voltar-button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  voltar,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Mostra o botão "Voltar"; o valor é a página de reserva se não houver tela anterior. */
  voltar?: string;
  className?: string;
}) {
  return (
    <div className={cn("animate-fade-up space-y-2", className)}>
      {voltar && <VoltarButton fallback={voltar} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="relative min-w-0 space-y-1 pl-4">
          <span
            aria-hidden
            className="absolute inset-y-1 left-0 w-1 origin-top animate-grow-y rounded-full bg-gradient-to-b from-primary to-brand-deep"
          />
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-[1.7rem]">{title}</h1>
          {description && <p className="text-sm text-muted-foreground sm:text-base">{description}</p>}
        </div>
        {actions && (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
