"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { AddressFields } from "@/components/shared/address-fields";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { DocumentoInput, MoneyInput, PhoneInput } from "@/components/shared/inputs";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { ESTADO_CIVIL, options, PAPEL_PESSOA, TIPO_PESSOA } from "@/lib/labels";
import { atualizarPessoa, criarPessoa } from "../actions";
import { PESSOA_VAZIA, pessoaSchema, type PessoaInput } from "../schemas";

export function PessoaForm({ pessoaId, valores }: { pessoaId?: string; valores?: PessoaInput }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const form = useForm<PessoaInput>({
    resolver: zodResolver(pessoaSchema),
    defaultValues: valores ?? PESSOA_VAZIA,
  });
  const tipo = useWatch({ control: form.control, name: "tipo" });
  const papeis = useWatch({ control: form.control, name: "papeis" });

  async function onSubmit(dados: PessoaInput) {
    const result = await run(
      () => (pessoaId ? atualizarPessoa(pessoaId, dados) : criarPessoa(dados)),
      { onSuccess: ({ id }) => router.push(`/pessoas/${id}`) },
    );
    if (!result.ok) applyServerErrors(form, result);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup className="grid gap-5 sm:grid-cols-4">
            <FormField control={form.control} name="tipo" label="Tipo" className="sm:col-span-1">
              {(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="tipo" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options(TIPO_PESSOA).map((opcao) => (
                      <SelectItem key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>

            <FormField
              control={form.control}
              name="nome"
              label={tipo === "PJ" ? "Razão social" : "Nome completo"}
              className="sm:col-span-3"
            >
              {(field) => <Input {...field} id="nome" />}
            </FormField>

            {tipo === "PJ" && (
              <FormField control={form.control} name="nomeFantasia" label="Nome fantasia" className="sm:col-span-2">
                {(field) => <Input {...field} id="nomeFantasia" />}
              </FormField>
            )}

            <FormField
              control={form.control}
              name="documento"
              label={tipo === "PJ" ? "CNPJ" : "CPF"}
              className="sm:col-span-2"
            >
              {(field) => <DocumentoInput {...field} id="documento" />}
            </FormField>

            {tipo === "PF" ? (
              <>
                <FormField control={form.control} name="rg" label="RG" className="sm:col-span-1">
                  {(field) => <Input {...field} id="rg" />}
                </FormField>
                <FormField control={form.control} name="orgaoEmissor" label="Órgão emissor" className="sm:col-span-1">
                  {(field) => <Input {...field} id="orgaoEmissor" placeholder="SSP/SP" />}
                </FormField>
                <FormField control={form.control} name="dataNascimento" label="Nascimento" className="sm:col-span-2">
                  {(field) => <Input {...field} id="dataNascimento" type="date" />}
                </FormField>
                <FormField control={form.control} name="estadoCivil" label="Estado civil" className="sm:col-span-2">
                  {(field) => (
                    <Select value={field.value || "_"} onValueChange={(v) => field.onChange(v === "_" ? "" : v)}>
                      <SelectTrigger id="estadoCivil" className="w-full">
                        <SelectValue placeholder="Não informado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_">Não informado</SelectItem>
                        {options(ESTADO_CIVIL).map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value}>
                            {opcao.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
                <FormField control={form.control} name="profissao" label="Profissão" className="sm:col-span-2">
                  {(field) => <Input {...field} id="profissao" />}
                </FormField>
                <FormField control={form.control} name="rendaMensal" label="Renda mensal" className="sm:col-span-2">
                  {(field) => <MoneyInput {...field} id="rendaMensal" />}
                </FormField>
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="representanteNome"
                  label="Nome do representante"
                  className="sm:col-span-2"
                >
                  {(field) => <Input {...field} id="representanteNome" />}
                </FormField>
                <FormField
                  control={form.control}
                  name="representanteDocumento"
                  label="CPF do representante"
                  className="sm:col-span-2"
                >
                  {(field) => <DocumentoInput {...field} id="representanteDocumento" />}
                </FormField>
              </>
            )}
          </FieldGroup>

          <FormField control={form.control} name="papeis" label="Papel desta pessoa">
            {() => (
              <div className="flex flex-wrap gap-4">
                {options(PAPEL_PESSOA).map((opcao) => (
                  <label key={opcao.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={papeis?.includes(opcao.value)}
                      onCheckedChange={(checked) => {
                        const atual = form.getValues("papeis");
                        form.setValue(
                          "papeis",
                          checked ? [...atual, opcao.value] : atual.filter((p) => p !== opcao.value),
                          { shouldValidate: true },
                        );
                      }}
                    />
                    {opcao.label}
                  </label>
                ))}
              </div>
            )}
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 sm:grid-cols-2">
            <FormField control={form.control} name="email" label="E-mail">
              {(field) => <Input {...field} id="email" type="email" />}
            </FormField>
            <FormField control={form.control} name="telefone1" label="Telefone / WhatsApp">
              {(field) => <PhoneInput {...field} id="telefone1" />}
            </FormField>
            <FormField control={form.control} name="telefone1Whats" className="sm:col-span-2">
              {(field) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  Este telefone tem WhatsApp
                </label>
              )}
            </FormField>
            <FormField control={form.control} name="telefone2" label="Telefone alternativo">
              {(field) => <PhoneInput {...field} id="telefone2" />}
            </FormField>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressFields control={form.control} setValue={form.setValue} />
        </CardContent>
      </Card>

      {tipo === "PF" && (
        <Card>
          <CardHeader>
            <CardTitle>Cônjuge (se houver)</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-5 sm:grid-cols-2">
              <FormField control={form.control} name="conjugeNome" label="Nome do cônjuge">
                {(field) => <Input {...field} id="conjugeNome" />}
              </FormField>
              <FormField control={form.control} name="conjugeDocumento" label="CPF do cônjuge">
                {(field) => <DocumentoInput {...field} id="conjugeDocumento" />}
              </FormField>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea {...form.register("observacoes")} rows={3} placeholder="Observações internas" />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <Button type="button" variant="outline" asChild>
          <Link href={pessoaId ? `/pessoas/${pessoaId}` : "/pessoas"}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner /> : <SaveIcon />}
          {pessoaId ? "Salvar alterações" : "Cadastrar pessoa"}
        </Button>
      </div>
    </form>
  );
}
