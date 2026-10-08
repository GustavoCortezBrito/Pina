import { LogoMark } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background">
      <div className="relative flex items-center justify-center">
        <span className="absolute size-16 animate-ping rounded-full bg-primary/20" />
        <LogoMark className="relative size-10 animate-pulse" />
      </div>
      <p className="animate-pulse text-sm text-muted-foreground">Carregando...</p>
    </div>
  );
}
