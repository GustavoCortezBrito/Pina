import { BuildingIcon, FileSignatureIcon, HandCoinsIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Logo, LogoMark } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

const DESTAQUES = [
  { icon: BuildingIcon, texto: "Imóveis, empreendimentos e fotos num só lugar" },
  { icon: FileSignatureIcon, texto: "Contratos com reajuste e PDF automáticos" },
  { icon: HandCoinsIcon, texto: "Cobranças, recibos e inadimplência sob controle" },
];

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  if (await getSession()) redirect(typeof next === "string" && next.startsWith("/") ? next : "/");

  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[1.05fr_1fr]">
      <section className="surface-brand relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <LogoMark className="pointer-events-none absolute -right-24 -bottom-24 size-[28rem] animate-float text-primary opacity-[0.09]" />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/3 -left-24 size-72 animate-glow rounded-full bg-primary/25 blur-3xl"
        />
        <Logo className="relative animate-fade-up scale-125 origin-left [&_.text-muted-foreground]:text-white/60" />
        <div className="relative max-w-md space-y-6">
          <h1 className="animate-fade-up text-4xl leading-tight font-bold tracking-tight [animation-delay:80ms]">
            A gestão das suas locações, <span className="text-gradient-brand">simples e organizada.</span>
          </h1>
          <ul className="space-y-3">
            {DESTAQUES.map(({ icon: Icon, texto }, i) => (
              <li
                key={texto}
                className="flex animate-fade-up items-center gap-3 text-white/80"
                style={{ animationDelay: `${160 + i * 80}ms` }}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
                  <Icon className="size-4.5" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/45">Pina&apos;s Empreendimentos · Barretos/SP</p>
      </section>

      <section className="relative flex flex-col items-center justify-center gap-8 overflow-hidden p-6 sm:p-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 size-80 rounded-full bg-primary/15 blur-3xl lg:hidden"
        />
        <Logo className="relative animate-scale-in scale-125 lg:hidden" />
        <div className="relative w-full max-w-sm animate-fade-up [animation-delay:100ms]">
          <LoginForm next={typeof next === "string" ? next : undefined} />
        </div>
        <p className="relative animate-fade-up text-center text-xs text-muted-foreground [animation-delay:220ms]">
          Sistema interno de gestão de locações.
          <br />
          Não tem acesso? Fale com o administrador.
        </p>
      </section>
    </main>
  );
}
