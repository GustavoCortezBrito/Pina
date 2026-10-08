import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden bg-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--brand)_0%,transparent_60%)] opacity-15 dark:opacity-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 -z-10 size-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 -z-10 size-72 rounded-full bg-primary/10 blur-3xl"
      />

      <Logo className="animate-in fade-in zoom-in-95 scale-125 duration-500" />
      <div className="animate-in fade-in slide-in-from-bottom-2 w-full max-w-sm fill-mode-both delay-100 duration-500">
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
      <p className="animate-in fade-in text-center text-xs text-muted-foreground fill-mode-both delay-300 duration-500">
        Sistema interno de gestão de locações.
        <br />
        Não tem acesso? Fale com o administrador.
      </p>
    </main>
  );
}
