"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Combobox, type ComboboxOption } from "@/components/shared/combobox";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { MoneyInput } from "@/components/shared/inputs";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toISODate, today } from "@/lib/dates";
import { atualizarDespesa, criarDespesa } from "../actions";
import { despesaSchema, type DespesaInput } from "../schemas";

type Props = {
  imoveis: ComboboxOption[];
  categorias: ComboboxOption[];
  despesa?: DespesaInput & { id: string };
  trigger?: React.ReactNode;
};

export function DespesaDialog({ imoveis, categorias, despesa, trigger }: Props) {
  const { pending, run } = useAction();
  const [aberto, setAberto] = React.useState(false);
  const form = useForm<DespesaInput>({
    resolver: zodResolver(despesaSchema),
    defaultValues: despesa ?? {
      imovelId: null,
      categoriaId: categorias[0]?.value ?? "",
      data: toISODate(today()),
      valor: 0,
      fornecedor: "",
      descricao: "",
      pago: true,
    },
  });

  async function onSubmit(dados: DespesaInput) {
    const result = await run(() => (despesa ? atualizarDespesa(despesa.id, dados) : criarDespesa(dados)));
    if (result.ok) setAberto(false);
    else applyServerErrors(form, result);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg">
            <PlusIcon /> Nova despesa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg!">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar despesa" : "Nova despesa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FieldGroup className="grid gap-5 sm:grid-cols-2">
            <FormField control={form.control} name="categoriaId" label="Categoria">
              {(field) => (
                <Combobox value={field.value} onChange={(v) => field.onChange(v ?? "")} options={categorias} />
              )}
            </FormField>
            <FormField control={form.control} name="imovelId" label="Imóvel" description="Opcional">
              {(field) => (
                <Combobox value={field.value} onChange={field.onChange} options={imoveis} limpar="Nenhum" placeholder="Nenhum" />
              )}
            </FormField>
            <FormField control={form.control} name="data" label="Data">
              {(field) => <Input {...field} id="despesa-data" type="date" />}
            </FormField>
            <FormField control={form.control} name="valor" label="Valor">
              {(field) => <MoneyInput {...field} id="despesa-valor" onChange={(v) => field.onChange(v ?? 0)} />}
            </FormField>
            <FormField control={form.control} name="fornecedor" label="Fornecedor" className="sm:col-span-2">
              {(field) => <Input {...field} id="despesa-fornecedor" />}
            </FormField>
            <FormField control={form.control} name="descricao" label="Descrição" className="sm:col-span-2">
              {(field) => <Textarea {...field} id="despesa-descricao" rows={2} />}
            </FormField>
            <FormField control={form.control} name="pago" className="sm:col-span-2">
              {(field) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                  Já foi pago
                </label>
              )}
            </FormField>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner /> : despesa ? <PencilIcon /> : <PlusIcon />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
