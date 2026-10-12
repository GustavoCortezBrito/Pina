import { ArrowLeftIcon, HouseIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
      <span className="relative mx-auto flex size-20 items-center justify-center">
        <span className="absolute inset-0 animate-glow rounded-full bg-primary/25 blur-xl" />
        <span className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-brand-deep text-primary-foreground shadow-xl shadow-primary/30">
          <HouseIcon className="size-9" />
        </span>
      </span>
      <h1 className="mt-8 font-display text-3xl font-medium tracking-tight text-balance sm:text-5xl">
        Este imóvel não está mais disponível
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
        Ele pode ter sido alugado. Veja os outros imóveis da vitrine.
      </p>
      <Link
        href="/vitrine#imoveis"
        className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
      >
        <ArrowLeftIcon className="size-5" /> Ver imóveis disponíveis
      </Link>
    </main>
  );
}
