"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { salvarLocador } from "../actions";
import { locadorSchema, type Locador } from "../schemas";

export function LocadorForm({ valores }: { valores: Locador }) {
  const { pending, run } = useAction();
  const form = useForm<Locador>({ resolver: zodResolver(locadorSchema), defaultValues: valores });

  async function onSubmit(dados: Locador) {
    const result = await run(() => salvarLocador(dados), { refresh: false });
    if (!result.ok) applyServerErrors(form, result);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <FormField control={form.control} name="nome" label="Nome do locador">
          {(field) => <Input {...field} id="locador-nome" />}
        </FormField>
        <FormField control={form.control} name="documento" label="CPF/CNPJ">
          {(field) => <Input {...field} id="locador-documento" />}
        </FormField>
        <FormField control={form.control} name="endereco" label="Endereço" className="sm:col-span-2">
          {(field) => <Input {...field} id="locador-endereco" />}
        </FormField>
        <FormField control={form.control} name="cidade" label="Cidade/UF (usada no foro do contrato)">
          {(field) => <Input {...field} id="locador-cidade" />}
        </FormField>
        <FormField control={form.control} name="telefone" label="Telefone">
          {(field) => <Input {...field} id="locador-telefone" />}
        </FormField>
        <FormField control={form.control} name="email" label="E-mail">
          {(field) => <Input {...field} id="locador-email" type="email" />}
        </FormField>
        <FormField control={form.control} name="chavePix" label="Chave Pix">
          {(field) => <Input {...field} id="locador-pix" />}
        </FormField>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : <SaveIcon />}
        Salvar
      </Button>
    </form>
  );
}
