"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AddressFields } from "@/components/shared/address-fields";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { atualizarEmpreendimento, criarEmpreendimento } from "../actions";
import { EMPREENDIMENTO_VAZIO, empreendimentoSchema, type EmpreendimentoInput } from "../schemas";

export function EmpreendimentoForm({
  empreendimentoId,
  valores,
}: {
  empreendimentoId?: string;
  valores?: EmpreendimentoInput;
}) {
  const router = useRouter();
  const { pending, run } = useAction();
  const form = useForm<EmpreendimentoInput>({
    resolver: zodResolver(empreendimentoSchema),
    defaultValues: valores ?? EMPREENDIMENTO_VAZIO,
  });

  async function onSubmit(dados: EmpreendimentoInput) {
    const result = await run(
      () =>
        empreendimentoId
          ? atualizarEmpreendimento(empreendimentoId, dados)
          : criarEmpreendimento(dados),
      { onSuccess: ({ id }) => router.push(`/empreendimentos/${id}`) },
    );
    if (!result.ok) applyServerErrors(form, result);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Dados do empreendimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <FormField control={form.control} name="nome" label="Nome">
              {(field) => <Input {...field} id="nome" placeholder="Edifício ADM" />}
            </FormField>
          </FieldGroup>
          <AddressFields control={form.control} setValue={form.setValue} comComplemento={false} />
          <FieldGroup>
            <FormField control={form.control} name="observacoes" label="Observações">
              {(field) => <Textarea {...field} id="observacoes" rows={3} />}
            </FormField>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" asChild>
          <Link
            href={empreendimentoId ? `/empreendimentos/${empreendimentoId}` : "/empreendimentos"}
          >
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner /> : <SaveIcon />}
          {empreendimentoId ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
