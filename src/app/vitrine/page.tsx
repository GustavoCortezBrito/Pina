import {
  ArrowDownIcon,
  CalendarCheckIcon,
  CameraIcon,
  HouseIcon,
  MapPinIcon,
  SearchIcon,
  SearchXIcon,
  SparklesIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClearFilters, FilterSelect } from "@/components/shared/filters";
import { Pagination } from "@/components/shared/pagination";
import { VitrineCard } from "@/features/vitrine/components/vitrine-card";
import { WhatsappIcon } from "@/features/vitrine/components/whatsapp-icon";
import { bairrosDaVitrine, listarVitrine, resumoVitrine } from "@/features/vitrine/queries";
import { linkWhatsapp } from "@/features/vitrine/whatsapp";
import { TipoImovel } from "@/generated/prisma/enums";
import { options, TIPO_IMOVEL } from "@/lib/labels";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Imóveis para alugar em Barretos/SP",
  description: "Casas, apartamentos e salas comerciais disponíveis para locação — Pina's Empreendimentos.",
};

// A vitrine muda quando um imóvel é publicado, alugado ou tem as fotos trocadas.
export const dynamic = "force-dynamic";

const QUARTOS = [1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}+ quarto${n > 1 ? "s" : ""}` }));
const PRECOS = [800, 1000, 1500, 2000, 3000, 5000].map((v) => ({
  value: String(v),
  label: `Até R$ ${v.toLocaleString("pt-BR")}`,
}));

const PASSOS = [
  {
    icon: SearchIcon,
    titulo: "Escolha o imóvel",
    texto: "Veja fotos reais, valores e todas as características de cada imóvel disponível.",
  },
  {
    icon: WhatsappIcon,
    titulo: "Chame no WhatsApp",
    texto: "Toque em “Tenho interesse” e a mensagem já vai pronta, com o código do imóvel.",
  },
  {
    icon: CalendarCheckIcon,
    titulo: "Agende sua visita",
    texto: "Combine o melhor horário para conhecer o imóvel pessoalmente, sem complicação.",
  },
];

export default async function VitrinePage(props: PageProps<"/vitrine">) {
  const params = await props.searchParams;
  const ler = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);
  const tipo = Object.values(TipoImovel).includes(ler("tipo") as TipoImovel)
    ? (ler("tipo") as TipoImovel)
    : undefined;

  const [{ itens, total, page, pageCount }, bairros, resumo, { site, locador }] = await Promise.all([
    listarVitrine({
      tipo,
      quartos: Number(ler("quartos")) || undefined,
      precoMax: Number(ler("preco")) || undefined,
      bairro: ler("bairro"),
      page: Number(ler("page") ?? 1),
    }),
    bairrosDaVitrine(),
    resumoVitrine(),
    getSettings(),
  ]);

  const whats = linkWhatsapp(site.whatsapp);
  const cidade = locador.cidade || "Barretos/SP";
  const temFiltro = Boolean(tipo || ler("quartos") || ler("preco") || ler("bairro"));

  // Atalhos por tipo: mantém os outros filtros e troca só o tipo.
  const hrefTipo = (t?: TipoImovel) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && k !== "tipo" && k !== "page") q.set(k, v);
    if (t) q.set("tipo", t);
    const s = q.toString();
    return `/vitrine${s ? `?${s}` : ""}#imoveis`;
  };
  const tiposComImovel = (Object.keys(TIPO_IMOVEL) as TipoImovel[]).filter((t) => (resumo.porTipo[t] ?? 0) > 0);

  return (
    <>
      {/* ---------- Topo com foto ---------- */}
      <section className="relative -mt-20 overflow-hidden bg-surface-strong text-white">
        <img
          src="/vitrine/hero.webp"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 size-full animate-ken-burns object-cover object-[70%_center]"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.01_50)] via-[oklch(0.12_0.01_50/0.75)] to-transparent" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.01_50)] via-transparent to-black/40" />
        <span
          aria-hidden
          className="absolute -bottom-32 -left-24 size-[28rem] animate-glow rounded-full bg-primary/25 blur-[100px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 pt-40 pb-44 sm:px-6 sm:pt-48 sm:pb-52 lg:pt-52 lg:pb-60">
          <p className="glass-dark inline-flex animate-fade-up items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2 text-sm font-medium text-white/90">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/15">
              <span className="size-2 animate-pulse-dot rounded-full bg-emerald-400 text-emerald-400" />
            </span>
            {resumo.total > 0
              ? `${resumo.total} ${resumo.total === 1 ? "imóvel disponível" : "imóveis disponíveis"} agora`
              : "Novas vagas em breve"}
            <span className="text-white/40">·</span>
            <span className="text-white/70">{cidade}</span>
          </p>

          <h1 className="mt-7 max-w-3xl animate-fade-up font-display text-[2.75rem] leading-[1.02] font-medium tracking-tight text-balance [animation-delay:80ms] sm:text-6xl lg:text-7xl">
            O lugar certo para <em className="text-gradient-brand pr-1 font-normal italic">viver</em> e{" "}
            <em className="text-gradient-brand pr-1 font-normal italic">trabalhar</em>
          </h1>

          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-white/75 [animation-delay:160ms] sm:text-xl">
            {site.chamada}
          </p>

          <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:240ms]">
            <a
              href="#imoveis"
              id="hero-ver-imoveis"
              className="group inline-flex h-14 items-center gap-2.5 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[0_14px_40px_-12px_color-mix(in_oklch,var(--primary)_75%,transparent)] transition-all hover:-translate-y-0.5 hover:brightness-105"
            >
              Ver imóveis
              <ArrowDownIcon className="size-5 transition-transform group-hover:translate-y-0.5" />
            </a>
            {whats && (
              <a
                href={whats}
                target="_blank"
                rel="noreferrer"
                id="hero-whatsapp"
                className="glass-dark inline-flex h-14 items-center gap-2.5 rounded-full px-7 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
              >
                <WhatsappIcon className="text-[#25D366]" /> Falar no WhatsApp
              </a>
            )}
          </div>

          <ul className="mt-14 flex animate-fade-up flex-wrap gap-x-8 gap-y-3 text-sm text-white/70 [animation-delay:320ms]">
            <li className="flex items-center gap-2">
              <CameraIcon className="size-4 text-primary" /> Fotos reais dos imóveis
            </li>
            <li className="flex items-center gap-2">
              <WhatsappIcon className="size-4 text-primary" /> Atendimento pelo WhatsApp
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="size-4 text-primary" /> {cidade}
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- Busca flutuante ---------- */}
      <div className="relative z-10 mx-auto -mt-28 max-w-7xl px-4 sm:px-6">
        <div className="animate-fade-up rounded-[2rem] bg-card/85 p-5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.45)] ring-1 ring-border backdrop-blur-2xl [animation-delay:380ms] sm:p-7">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary-ink uppercase">Busca</p>
              <h2 className="mt-1 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                Encontre o seu próximo endereço
              </h2>
            </div>
            <ClearFilters />
          </div>

          {tiposComImovel.length > 1 && (
            <nav aria-label="Tipo de imóvel" className="no-scrollbar -mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1">
              {[undefined, ...tiposComImovel].map((t) => {
                const ativo = tipo === t;
                return (
                  <Link
                    key={t ?? "todos"}
                    href={hrefTipo(t)}
                    scroll={false}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      ativo
                        ? "border-transparent bg-foreground text-background shadow-md"
                        : "bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {t ? TIPO_IMOVEL[t] : "Todos"}
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-xs tabular-nums",
                        ativo ? "bg-background/20" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {t ? resumo.porTipo[t] : resumo.total}
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div
            className={cn(
              "mt-5 grid grid-cols-2 gap-2.5 [&_button[role=combobox]]:h-12 [&_button[role=combobox]]:w-full [&_button[role=combobox]]:rounded-xl [&_button[role=combobox]]:bg-background/70",
              tiposComImovel.length > 1 ? "lg:grid-cols-3" : "lg:grid-cols-4",
            )}
          >
            {tiposComImovel.length <= 1 && (
              <FilterSelect param="tipo" placeholder="Tipo" options={options(TIPO_IMOVEL)} />
            )}
            <FilterSelect param="quartos" placeholder="Quartos" options={QUARTOS} />
            <FilterSelect param="preco" placeholder="Valor" options={PRECOS} allLabel="Qualquer" />
            {bairros.length > 1 ? (
              <FilterSelect param="bairro" placeholder="Bairro" options={bairros.map((b) => ({ value: b, label: b }))} />
            ) : (
              <div className="col-span-2 hidden items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground lg:col-span-1 lg:flex">
                <MapPinIcon className="size-4 text-primary-ink" /> {cidade}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Resultados ---------- */}
      <main id="imoveis" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary-ink uppercase">
              {tipo ? TIPO_IMOVEL[tipo] : "Disponíveis"}
            </p>
            <h2 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
              {temFiltro ? "Resultado da busca" : "Imóveis para alugar"}
            </h2>
          </div>
          {itens.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{total}</span>{" "}
              {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
            </p>
          )}
        </div>

        {itens.length === 0 ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-dashed bg-card/60 px-6 py-16 text-center sm:py-20">
            <span aria-hidden className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="relative mx-auto max-w-md">
              <span className="relative mx-auto flex size-20 items-center justify-center">
                <span className="absolute inset-0 animate-glow rounded-full bg-primary/25 blur-xl" />
                <span className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-brand-deep text-primary-foreground shadow-xl shadow-primary/30">
                  {temFiltro ? <SearchXIcon className="size-9" /> : <HouseIcon className="size-9" />}
                </span>
              </span>
              <h3 className="mt-7 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                {temFiltro ? "Nenhum imóvel com esses filtros" : "Em breve, novos imóveis"}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {temFiltro
                  ? "Tente mudar ou limpar os filtros para ver mais opções."
                  : "No momento não há imóveis disponíveis. Fale com a gente pelo WhatsApp para saber das próximas vagas."}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {temFiltro && (
                  <Link
                    href="/vitrine#imoveis"
                    scroll={false}
                    className="inline-flex h-12 items-center rounded-full border bg-background px-6 font-semibold transition-colors hover:border-primary/60"
                  >
                    Ver todos os imóveis
                  </Link>
                )}
                {whats && (
                  <a
                    href={whats}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold transition-all hover:-translate-y-0.5"
                  >
                    <WhatsappIcon /> Perguntar pelo WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {itens.map((imovel, i) => (
                <VitrineCard key={imovel.id} imovel={imovel} index={i} />
              ))}
            </div>
            <div className="mt-10">
              <Pagination page={page} pageCount={pageCount} total={total} label="imóveis" />
            </div>
          </>
        )}
      </main>

      {/* ---------- Como funciona ---------- */}
      <section id="como-funciona" className="mx-auto mt-28 max-w-7xl scroll-mt-24 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary-ink uppercase">
            <SparklesIcon className="size-3.5" /> Simples e rápido
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-balance sm:text-5xl">
            Do clique à chave na mão em <em className="text-gradient-brand pr-1 italic">três passos</em>
          </h2>
        </div>

        <ol className="relative mt-14 grid gap-5 md:grid-cols-3">
          <span
            aria-hidden
            className="absolute top-12 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent md:block"
          />
          {PASSOS.map(({ icon: Icon, titulo, texto }, i) => (
            <li
              key={titulo}
              className="group relative rounded-[1.75rem] bg-card p-7 ring-1 ring-border transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.3)] hover:ring-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-brand-deep text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="size-6" />
                </span>
                <span className="font-display text-5xl font-medium text-muted-foreground/25 tabular-nums italic">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{titulo}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Chamada final ---------- */}
      {whats && (
        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
          <div className="surface-brand relative overflow-hidden rounded-[2rem] px-6 py-14 sm:px-14 sm:py-16">
            <img
              src="/vitrine/hero.webp"
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 [mask-image:linear-gradient(to_right,transparent,black_60%)] md:block"
            />
            <span aria-hidden className="absolute -top-24 -right-24 size-80 animate-glow rounded-full bg-primary/30 blur-3xl" />
            <div className="relative max-w-xl">
              <h2 className="font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
                Não encontrou o que procura?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/70">
                Conte pelo WhatsApp o que você precisa — tipo, bairro e valor — e a gente te ajuda a encontrar.
              </p>
              <a
                href={whats}
                target="_blank"
                rel="noreferrer"
                id="cta-whatsapp"
                className="btn-whatsapp mt-8 inline-flex h-14 items-center gap-2.5 rounded-full px-7 text-base font-semibold transition-all hover:-translate-y-0.5"
              >
                <WhatsappIcon /> Conversar agora
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
