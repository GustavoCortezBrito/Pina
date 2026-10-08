"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, SendIcon, XIcon } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm, useWatch, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { Combobox, type ComboboxOption } from "@/components/shared/combobox";
import { FormField } from "@/components/shared/form-field";
import { MoneyInput, NumberInput } from "@/components/shared/inputs";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { gerarCobrancas } from "@/features/contratos/services/cobrancas";
import { parseISODate, toISODate, today } from "@/lib/dates";
import { FINALIDADE, INDICE_REAJUSTE, options, TIPO_GARANTIA } from "@/lib/labels";
import { formatBRL, sum } from "@/lib/money";
import { cn } from "@/lib/utils";
import { contratoSchema, type ContratoInput } from "../schemas";

const ETAPAS = ["Imóvel", "Partes", "Condições", "Revisão"] as const;

const CAMPOS_POR_ETAPA: FieldPath<ContratoInput>[][] = [
  ["imovelId", "finalidade"],
  ["locatarioId", "fiadorId", "garantia", "caucaoValor", "seguradora", "apolice"],
  ["dataInicio", "prazoMeses", "valorAluguel", "diaVencimento", "indiceReajuste", "encargos"],
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
  padroes: { prazoMeses: number; diaVencimento: number; indiceReajuste: ContratoInput["indiceReajuste"]; aluguelAntecipado: boolean };
}) {
  const [etapa, setEtapa] = React.useState(0);
  const form = useForm<ContratoInput>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
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
  const valores = useWatch({ control: form.control });

  const preview = React.useMemo(() => {
    const dataInicio = parseISODate(valores.dataInicio);
    if (!dataInicio || !valores.valorAluguel || !valores.prazoMeses) return null;
    return gerarCobrancas({
      dataInicio,
      prazoMeses: valores.prazoMeses,
      diaVencimento: valores.diaVencimento ?? 10,
      valorAluguel: valores.valorAluguel,
      valorEncargos: sum((valores.encargos ?? []).map((e) => e?.valor)),
      aluguelAntecipado: valores.aluguelAntecipado ?? false,
    });
  }, [valores]);

  async function avancar() {
    const valido = await form.trigger(CAMPOS_POR_ETAPA[etapa]);
    if (valido) setEtapa((e) => Math.min(ETAPAS.length - 1, e + 1));
  }

  function finalizar() {
    toast.info("Em breve: este passo vai gravar o contrato e gerar as cobranças no banco.");
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2 text-sm">
        {ETAPAS.map((nome, index) => (
          <li key={nome} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                index === etapa
                  ? "bg-primary text-primary-foreground"
                  : index < etapa
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
            <span className={index === etapa ? "font-medium" : "text-muted-foreground"}>{nome}</span>
            {index < ETAPAS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </li>
        ))}
      </ol>

      <Card>
        <CardContent className="space-y-6">
          {etapa === 0 && (
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
          )}

          {etapa === 1 && (
            <FieldGroup className="grid gap-5 sm:grid-cols-2">
              <FormField control={form.control} name="locatarioId" label="Locatário" className="sm:col-span-2">
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
                  {(field) => <NumberInput {...field} min={1} onChange={(v) => field.onChange(v ?? 30)} />}
                </FormField>
                <FormField control={form.control} name="diaVencimento" label="Dia de vencimento">
                  {(field) => <NumberInput {...field} min={1} max={31} onChange={(v) => field.onChange(v ?? 10)} />}
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
                      <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                      Aluguel antecipado
                    </label>
                  )}
                </FormField>
              </FieldGroup>

              <div className="space-y-2">
                <p className="text-sm font-medium">Encargos cobrados junto com o aluguel</p>
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Condomínio"
                      {...form.register(`encargos.${index}.descricao` as const)}
                      className="flex-1"
                    />
                    <MoneyInput
                      value={valores.encargos?.[index]?.valor ?? 0}
                      onChange={(v) => form.setValue(`encargos.${index}.valor`, v ?? 0)}
                      className="w-40"
                    />
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
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
                  <p className="text-sm font-medium">{TIPO_GARANTIA[valores.garantia ?? "SEM_GARANTIA"]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor do aluguel</p>
                  <p className="text-sm font-medium">{formatBRL(valores.valorAluguel)}</p>
                </div>
              </div>

              {preview && (
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Prévia das cobranças ({preview.length} parcelas, total {formatBRL(sum(preview.map((c) => c.valorTotal)))})
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
        <Button type="button" variant="outline" disabled={etapa === 0} onClick={() => setEtapa((e) => e - 1)}>
          <ArrowLeftIcon /> Voltar
        </Button>
        {etapa < ETAPAS.length - 1 ? (
          <Button type="button" onClick={avancar}>
            Próximo <ArrowRightIcon />
          </Button>
        ) : (
          <Button type="button" onClick={finalizar}>
            <SendIcon /> Criar contrato
          </Button>
        )}
      </div>
    </div>
  );
}
