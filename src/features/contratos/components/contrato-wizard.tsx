"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FilePlus2Icon,
  FileSignatureIcon,
  FileUpIcon,
  PlusIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { useFieldArray, useForm, useWatch, type FieldPath } from "react-hook-form";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { Combobox, type ComboboxOption } from "@/components/shared/combobox";
import { MoneyInput, NumberInput } from "@/components/shared/inputs";
import { useAction } from "@/components/shared/use-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { criarContrato } from "@/features/contratos/actions";
import { gerarCobrancas } from "@/features/contratos/services/cobrancas";
import { parseISODate, startOfMonth, toISODate, today } from "@/lib/dates";
import { FINALIDADE, INDICE_REAJUSTE, options, TIPO_GARANTIA } from "@/lib/labels";
import { formatBRL, sum } from "@/lib/money";
import { cn } from "@/lib/utils";
import { contratoSchema, type ContratoInput } from "../schemas";

const ETAPAS = ["Imóvel", "Partes", "Condições", "Revisão"] as const;

// Sugestões de tipo de encargo; o campo continua livre para outros nomes.
const SUGESTOES_ENCARGO = ["Condomínio", "IPTU", "Água", "Luz", "Gás", "Taxa de lixo", "Seguro incêndio", "Internet"];

const CAMPOS_POR_ETAPA: FieldPath<ContratoInput>[][] = [
  ["origem", "imovelId", "finalidade"],
  ["locatarioId", "fiadorId", "garantia", "caucaoValor", "seguradora", "apolice"],
  [
    "dataInicio",
    "prazoMeses",
    "valorAluguel",
    "diaVencimento",
    "indiceReajuste",
    "encargos",
    "numeroOriginal",
    "primeiraCobranca",
    "reajustesAnteriores",
  ],
  [],
];

export function ContratoWizard({
  imoveis,
  inquilinos,
  fiadores,
  padroes,
}: {
  imoveis: ComboboxOption[];
  inquilinos: ComboboxOption[];
  fiadores: ComboboxOption[];
  padroes: {
    prazoMeses: number;
    diaVencimento: number;
    indiceReajuste: ContratoInput["indiceReajuste"];
    aluguelAntecipado: boolean;
  };
}) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [etapa, setEtapa] = React.useState(0);
  const form = useForm<ContratoInput>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      origem: "NOVO",
      numeroOriginal: "",
      primeiraCobranca: "",
      reajustesAnteriores: 0,
      imovelId: "",
      finalidade: "RESIDENCIAL",
      locatarioId: "",
      fiadorId: null,
      garantia: "FIADOR",
      caucaoValor: null,
      seguradora: "",
      apolice: "",
      dataInicio: toISODate(today()),
      prazoMeses: padroes.prazoMeses,
      valorAluguel: 0,
      diaVencimento: padroes.diaVencimento,
      aluguelAntecipado: padroes.aluguelAntecipado,
      indiceReajuste: padroes.indiceReajuste,
      encargos: [],
      observacoes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "encargos" });
  const garantia = useWatch({ control: form.control, name: "garantia" });
  const origem = useWatch({ control: form.control, name: "origem" });
  const existente = origem === "EXISTENTE";
  const [arquivo, setArquivo] = React.useState<File | null>(null);
  const inputArquivo = React.useRef<HTMLInputElement>(null);
  const valores = useWatch({ control: form.control });

  const preview = React.useMemo(() => {
    const dataInicio = parseISODate(valores.dataInicio);
    if (!dataInicio || !valores.valorAluguel || !valores.prazoMeses) return null;
    const todas = gerarCobrancas({
      dataInicio,
      prazoMeses: valores.prazoMeses,
      diaVencimento: valores.diaVencimento ?? 10,
      valorAluguel: valores.valorAluguel,
      valorEncargos: sum((valores.encargos ?? []).map((e) => e?.valor)),
      aluguelAntecipado: valores.aluguelAntecipado ?? false,
    });
    if (valores.origem !== "EXISTENTE") return todas;
    const desde = startOfMonth(parseISODate(valores.primeiraCobranca) ?? today());
    return todas.filter((c) => c.competencia >= desde);
  }, [valores]);

  async function avancar() {
    const valido = await form.trigger(CAMPOS_POR_ETAPA[etapa]);
    if (valido) setEtapa((e) => Math.min(ETAPAS.length - 1, e + 1));
  }

  async function enviarAssinado(contratoId: string, file: File) {
    const form = new FormData();
    form.set("entidade", "contrato");
    form.set("entidadeId", contratoId);
    form.set("categoria", "CONTRATO_ASSINADO");
    form.append("arquivos", file);
    try {
      const resposta = await fetch("/api/upload", { method: "POST", body: form });
      const dados = (await resposta.json()) as { ok: boolean; error?: string };
      if (!resposta.ok || !dados.ok) toast.error(`Contrato cadastrado, mas o arquivo não subiu: ${dados.error ?? "tente de novo na aba Arquivos."}`);
    } catch {
      toast.error("Contrato cadastrado, mas o arquivo não subiu. Anexe de novo na aba Arquivos do contrato.");
    }
  }

  function escolherOrigem(valor: "NOVO" | "EXISTENTE") {
    form.setValue("origem", valor);
    if (valor === "EXISTENTE" && !form.getValues("primeiraCobranca")) {
      form.setValue("primeiraCobranca", toISODate(startOfMonth(today())));
    }
  }

  async function finalizar() {
    const dados = form.getValues();
    const result = await run(() => criarContrato(dados), {
      onSuccess: async ({ id }) => {
        if (arquivo) await enviarAssinado(id, arquivo);
        router.push(`/contratos/${id}`);
      },
    });
    if (!result.ok) applyServerErrors(form, result);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ol className="grid grid-cols-4 gap-2 text-sm">
          {ETAPAS.map((nome, index) => (
            <li key={nome} className="space-y-2">
              <span className="relative block h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    "absolute inset-0 origin-left rounded-full bg-gradient-to-r from-primary to-brand-deep transition-transform duration-500",
                    index <= etapa ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                    index === etapa
                      ? "scale-110 bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : index < etapa
                        ? "bg-primary/15 text-primary-ink"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {index < etapa ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "truncate",
                    index === etapa ? "font-semibold" : "hidden text-muted-foreground sm:inline",
                  )}
                >
                  {nome}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Card key={etapa} className="animate-fade-up">
        <CardContent className="space-y-6">
          {etapa === 0 && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Como cadastrar o contrato">
                {(
                  [
                    {
                      valor: "NOVO" as const,
                      icon: FilePlus2Icon,
                      titulo: "Novo contrato",
                      texto: "Vou gerar o contrato pelo sistema, com o modelo, e depois imprimir para assinar.",
                    },
                    {
                      valor: "EXISTENTE" as const,
                      icon: FileSignatureIcon,
                      titulo: "Contrato que já existe",
                      texto: "Já está assinado. Quero cadastrar para controlar vencimentos e cobranças, e anexar o arquivo.",
                    },
                  ] as const
                ).map(({ valor, icon: Icon, titulo, texto }) => (
                  <button
                    key={valor}
                    type="button"
                    role="radio"
                    aria-checked={origem === valor}
                    onClick={() => escolherOrigem(valor)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      origem === valor
                        ? "border-primary bg-primary/8 ring-2 ring-primary/40"
                        : "hover:border-primary/50 hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        origem === valor ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold">{titulo}</span>
                      <span className="text-sm text-muted-foreground">{texto}</span>
                    </span>
                  </button>
                ))}
              </div>
            <FieldGroup className="grid gap-5 sm:grid-cols-2">
              <FormField control={form.control} name="imovelId" label="Imóvel">
                {(field) => (
                  <Combobox
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? "")}
                    options={imoveis}
                    placeholder="Selecione o imóvel"
                    vazio="Nenhum imóvel disponível."
                  />
                )}
              </FormField>
              <FormField control={form.control} name="finalidade" label="Finalidade">
                {(field) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options(FINALIDADE).map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </FieldGroup>
            </div>
          )}

          {etapa === 1 && (
            <FieldGroup className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="locatarioId"
                label="Locatário"
                className="sm:col-span-2"
              >
                {(field) => (
                  <Combobox
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? "")}
                    options={inquilinos}
                    placeholder="Selecione o locatário"
                    vazio="Cadastre a pessoa em Pessoas primeiro."
                  />
                )}
              </FormField>
              <FormField control={form.control} name="garantia" label="Garantia">
                {(field) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options(TIPO_GARANTIA).map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              {garantia === "FIADOR" && (
                <FormField control={form.control} name="fiadorId" label="Fiador">
                  {(field) => (
                    <Combobox
                      value={field.value}
                      onChange={field.onChange}
                      options={fiadores}
                      placeholder="Selecione o fiador"
                      vazio="Cadastre a pessoa em Pessoas primeiro."
                    />
                  )}
                </FormField>
              )}
              {garantia === "CAUCAO" && (
                <FormField
                  control={form.control}
                  name="caucaoValor"
                  label="Valor da caução"
                  description="Máximo de 3 aluguéis (Lei 8.245/91)."
                >
                  {(field) => <MoneyInput {...field} />}
                </FormField>
              )}
              {garantia === "SEGURO_FIANCA" && (
                <>
                  <FormField control={form.control} name="seguradora" label="Seguradora">
                    {(field) => <Input {...field} />}
                  </FormField>
                  <FormField control={form.control} name="apolice" label="Nº da apólice">
                    {(field) => <Input {...field} />}
                  </FormField>
                </>
              )}
            </FieldGroup>
          )}

          {etapa === 2 && (
            <div className="space-y-6">
              <FieldGroup className="grid gap-5 sm:grid-cols-3">
                <FormField control={form.control} name="dataInicio" label="Início do contrato">
                  {(field) => <Input {...field} type="date" />}
                </FormField>
                <FormField control={form.control} name="prazoMeses" label="Prazo (meses)">
                  {(field) => (
                    <NumberInput {...field} min={1} onChange={(v) => field.onChange(v ?? 30)} />
                  )}
                </FormField>
                <FormField control={form.control} name="diaVencimento" label="Dia de vencimento">
                  {(field) => (
                    <NumberInput
                      {...field}
                      min={1}
                      max={31}
                      onChange={(v) => field.onChange(v ?? 10)}
                    />
                  )}
                </FormField>
                <FormField control={form.control} name="valorAluguel" label="Valor do aluguel">
                  {(field) => <MoneyInput {...field} onChange={(v) => field.onChange(v ?? 0)} />}
                </FormField>
                <FormField control={form.control} name="indiceReajuste" label="Índice de reajuste">
                  {(field) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options(INDICE_REAJUSTE).map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value}>
                            {opcao.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
                <FormField control={form.control} name="aluguelAntecipado" className="self-end">
                  {(field) => (
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(c) => field.onChange(c === true)}
                      />
                      Aluguel antecipado
                    </label>
                  )}
                </FormField>
              </FieldGroup>

              {existente && (
                <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm">
                    <strong>Contrato que já existe:</strong> informe a data de início real e o aluguel{" "}
                    <strong>de hoje</strong>. O sistema só cobra a partir do mês que você escolher abaixo; os meses
                    anteriores não viram cobranças atrasadas.
                  </p>
                  <FieldGroup className="grid gap-5 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="primeiraCobranca"
                      label="Cobrar pelo sistema a partir de"
                      description="Primeiro mês a controlar aqui."
                    >
                      {(field) => <Input {...field} type="date" />}
                    </FormField>
                    <FormField
                      control={form.control}
                      name="reajustesAnteriores"
                      label="Reajustes já aplicados"
                      description="Quantas vezes o aluguel já foi reajustado."
                    >
                      {(field) => <NumberInput {...field} min={0} onChange={(v) => field.onChange(v ?? 0)} />}
                    </FormField>
                    <FormField
                      control={form.control}
                      name="numeroOriginal"
                      label="Nº do contrato (opcional)"
                      description="Como ele é chamado hoje."
                    >
                      {(field) => <Input {...field} />}
                    </FormField>
                  </FieldGroup>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Encargos cobrados junto com o aluguel</p>
                <datalist id="sugestoes-encargo">
                  {SUGESTOES_ENCARGO.map((nome) => (
                    <option key={nome} value={nome} />
                  ))}
                </datalist>
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_9rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_11rem_auto]">
                    <Input
                      list="sugestoes-encargo"
                      placeholder="Tipo do encargo (ex.: Condomínio)"
                      aria-label="Tipo do encargo"
                      autoComplete="off"
                      {...form.register(`encargos.${index}.descricao` as const)}
                    />
                    <MoneyInput
                      value={valores.encargos?.[index]?.valor ?? 0}
                      onChange={(v) => form.setValue(`encargos.${index}.valor`, v ?? 0)}
                      aria-label="Valor do encargo"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                    >
                      <XIcon />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ descricao: "", valor: 0 })}
                >
                  <PlusIcon /> Adicionar encargo
                </Button>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Imóvel</p>
                  <p className="text-sm font-medium">
                    {imoveis.find((o) => o.value === valores.imovelId)?.label ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Locatário</p>
                  <p className="text-sm font-medium">
                    {inquilinos.find((o) => o.value === valores.locatarioId)?.label ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Garantia</p>
                  <p className="text-sm font-medium">
                    {TIPO_GARANTIA[valores.garantia ?? "SEM_GARANTIA"]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor do aluguel</p>
                  <p className="text-sm font-medium">{formatBRL(valores.valorAluguel)}</p>
                </div>
              </div>

              <div
                className={cn(
                  "space-y-2 rounded-xl border p-4",
                  existente ? "border-primary/40 bg-primary/5" : "border-dashed",
                )}
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <FileUpIcon className="size-4 text-primary-ink" />
                  {existente ? "Contrato assinado (recomendado)" : "Contrato assinado (opcional, pode anexar depois)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, foto ou documento. Fica guardado na aba Arquivos do contrato para consulta.
                </p>
                <input
                  ref={inputArquivo}
                  type="file"
                  accept="application/pdf,.doc,.docx,.odt,image/jpeg,image/png"
                  className="sr-only"
                  onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => inputArquivo.current?.click()}>
                    <FileUpIcon /> {arquivo ? "Trocar arquivo" : "Escolher arquivo"}
                  </Button>
                  {arquivo && (
                    <span className="flex items-center gap-1 text-sm font-medium">
                      {arquivo.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Remover arquivo"
                        onClick={() => {
                          setArquivo(null);
                          if (inputArquivo.current) inputArquivo.current.value = "";
                        }}
                      >
                        <XIcon />
                      </Button>
                    </span>
                  )}
                </div>
              </div>

              {preview && (
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Prévia das cobranças ({preview.length} parcelas, total{" "}
                    {formatBRL(sum(preview.map((c) => c.valorTotal)))})
                  </p>
                  <div className="max-h-72 overflow-y-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competência</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.map((cobranca, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize">
                              {toISODate(cobranca.competencia)}
                              {cobranca.proporcional && (
                                <Badge variant="secondary" className="ml-2">
                                  proporcional
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{toISODate(cobranca.vencimento)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatBRL(cobranca.valorTotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={etapa === 0}
          onClick={() => setEtapa((e) => e - 1)}
        >
          <ArrowLeftIcon /> Voltar
        </Button>
        {etapa < ETAPAS.length - 1 ? (
          <Button type="button" onClick={avancar}>
            Próximo <ArrowRightIcon />
          </Button>
        ) : (
          <Button type="button" size="lg" disabled={pending} onClick={finalizar}>
            {pending ? <Spinner /> : <SendIcon />}
            {existente ? "Cadastrar contrato" : "Criar contrato"}
          </Button>
        )}
      </div>
    </div>
  );
}
