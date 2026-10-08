"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { NumberInput, PercentInput } from "@/components/shared/inputs";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { INDICE_REAJUSTE, options } from "@/lib/labels";
import { salvarFinanceiro } from "../actions";
import { financeiroSchema, type Financeiro } from "../schemas";

export function FinanceiroForm({ valores }: { valores: Financeiro }) {
  const { pending, run } = useAction();
  const form = useForm<Financeiro>({ resolver: zodResolver(financeiroSchema), defaultValues: valores });

  async function onSubmit(dados: Financeiro) {
    const result = await run(() => salvarFinanceiro(dados), { refresh: false });
    if (!result.ok) applyServerErrors(form, result);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <FormField control={form.control} name="percMulta" label="Multa por atraso" description="Padrão sugerido: 10%">
          {(field) => <PercentInput {...field} id="percMulta" />}
        </FormField>
        <FormField control={form.control} name="percJurosMes" label="Juros ao mês" description="Padrão sugerido: 1%">
          {(field) => <PercentInput {...field} id="percJurosMes" />}
        </FormField>
        <FormField control={form.control} name="diaVencimento" label="Dia de vencimento padrão">
          {(field) => <NumberInput {...field} id="diaVencimento" min={1} max={31} onChange={(v) => field.onChange(v ?? 10)} />}
        </FormField>
        <FormField control={form.control} name="indiceReajuste" label="Índice de reajuste padrão">
          {(field) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="indiceReajuste" className="w-full">
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
        <FormField control={form.control} name="prazoPadraoMeses" label="Prazo padrão do contrato (meses)">
          {(field) => <NumberInput {...field} id="prazoPadraoMeses" min={1} onChange={(v) => field.onChange(v ?? 30)} />}
        </FormField>
        <FormField
          control={form.control}
          name="multaRescisoriaMeses"
          label="Multa rescisória (nº de aluguéis)"
        >
          {(field) => <NumberInput {...field} id="multaRescisoriaMeses" min={0} max={12} onChange={(v) => field.onChange(v ?? 3)} />}
        </FormField>
        <FormField control={form.control} name="aluguelAntecipado" className="sm:col-span-2 sm:self-end">
          {(field) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
              Aluguel antecipado (vence no mesmo mês de uso, em vez do mês seguinte)
            </label>
          )}
        </FormField>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : <SaveIcon />}
        Salvar
      </Button>
    </form>
  );
}
