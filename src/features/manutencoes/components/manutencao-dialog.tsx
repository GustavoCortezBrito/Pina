"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Combobox, type ComboboxOption } from "@/components/shared/combobox";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { criarManutencao } from "../actions";
import { manutencaoSchema, type ManutencaoInput } from "../schemas";
import { options, PRIORIDADE } from "@/lib/labels";

export function ManutencaoDialog({ imoveis }: { imoveis: ComboboxOption[] }) {
  const { pending, run } = useAction();
  const [aberto, setAberto] = React.useState(false);
  const form = useForm<ManutencaoInput>({
    resolver: zodResolver(manutencaoSchema),
    defaultValues: { imovelId: "", titulo: "", descricao: "", prioridade: "MEDIA" },
  });

  async function onSubmit(dados: ManutencaoInput) {
    const result = await run(() => criarManutencao(dados));
    if (result.ok) {
      setAberto(false);
      form.reset();
    } else {
      applyServerErrors(form, result);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusIcon /> Nova manutenção
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova manutenção</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FieldGroup>
            <FormField control={form.control} name="imovelId" label="Imóvel">
              {(field) => (
                <Combobox
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  options={imoveis}
                  placeholder="Selecione o imóvel"
                />
              )}
            </FormField>
            <FormField control={form.control} name="titulo" label="O que precisa ser feito?">
              {(field) => <Input {...field} placeholder="Vazamento no banheiro social" />}
            </FormField>
            <FormField control={form.control} name="prioridade" label="Prioridade">
              {(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options(Object.fromEntries(Object.entries(PRIORIDADE).map(([k, v]) => [k, v.label]))).map(
                      (opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField control={form.control} name="descricao" label="Detalhes (opcional)">
              {(field) => <Textarea {...field} rows={3} />}
            </FormField>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner />}
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
