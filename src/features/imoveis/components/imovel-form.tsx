"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { AddressFields } from "@/components/shared/address-fields";
import { Combobox, type ComboboxOption } from "@/components/shared/combobox";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { MoneyInput, NumberInput } from "@/components/shared/inputs";
import { useAction } from "@/components/shared/use-action";
import { Badge } from "@/components/ui/badge";
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
import { MOBILIA, options, STATUS_IMOVEL, TIPO_IMOVEL } from "@/lib/labels";
import { criarImovel, atualizarImovel } from "../actions";
import { IMOVEL_VAZIO, imovelSchema, type ImovelInput } from "../schemas";

type Props = {
  imovelId?: string;
  valores?: ImovelInput;
  empreendimentos: ComboboxOption[];
  proprietarios: ComboboxOption[];
};

export function ImovelForm({ imovelId, valores, empreendimentos, proprietarios }: Props) {
  const router = useRouter();
  const { pending, run } = useAction();
  const form = useForm<ImovelInput>({
    resolver: zodResolver(imovelSchema),
    defaultValues: valores ?? IMOVEL_VAZIO,
  });

  async function onSubmit(dados: ImovelInput) {
    const result = await run(
      () => (imovelId ? atualizarImovel(imovelId, dados) : criarImovel(dados)),
      { onSuccess: ({ id }) => router.push(`/imoveis/${id}`) },
    );
    if (!result.ok) applyServerErrors(form, result);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 sm:grid-cols-6">
            <FormField
              control={form.control}
              name="codigo"
              label="Código"
              className="sm:col-span-2"
            >
              {(field) => (
                <Input
                  {...field}
                  id="codigo"
                  placeholder="ADM-02"
                  className="uppercase"
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                />
              )}
            </FormField>

            <FormField
              control={form.control}
              name="titulo"
              label="Nome do imóvel"
              className="sm:col-span-4"
            >
              {(field) => <Input {...field} id="titulo" placeholder="Apto 02 – Ed. ADM" />}
            </FormField>

            <FormField control={form.control} name="tipo" label="Tipo" className="sm:col-span-2">
              {(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="tipo" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options(TIPO_IMOVEL).map((opcao) => (
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
              name="status"
              label="Situação"
              className="sm:col-span-2"
            >
              {(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options(STATUS_IMOVEL).map((opcao) => (
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
              name="empreendimentoId"
              label="Empreendimento"
              className="sm:col-span-2"
              description="Prédio ou condomínio, quando houver."
            >
              {(field) => (
                <Combobox
                  id="empreendimentoId"
                  value={field.value}
                  onChange={field.onChange}
                  options={empreendimentos}
                  placeholder="Nenhum"
                  limpar="Nenhum"
                  vazio="Cadastre em Empreendimentos."
                />
              )}
            </FormField>

            <FormField
              control={form.control}
              name="proprietarioId"
              label="Proprietário"
              className="sm:col-span-3"
              description="Só é necessário se o imóvel for de terceiros."
            >
              {(field) => (
                <Combobox
                  id="proprietarioId"
                  value={field.value}
                  onChange={field.onChange}
                  options={proprietarios}
                  placeholder="Próprio"
                  limpar="Próprio"
                  vazio="Cadastre a pessoa primeiro."
                />
              )}
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

      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 sm:grid-cols-6">
            <FormField
              control={form.control}
              name="quartos"
              label="Quartos"
              className="sm:col-span-1"
            >
              {(field) => (
                <NumberInput
                  {...field}
                  id="quartos"
                  min={0}
                  onChange={(v) => field.onChange(v ?? 0)}
                />
              )}
            </FormField>
            <FormField
              control={form.control}
              name="suites"
              label="Suítes"
              className="sm:col-span-1"
            >
              {(field) => (
                <NumberInput
                  {...field}
                  id="suites"
                  min={0}
                  onChange={(v) => field.onChange(v ?? 0)}
                />
              )}
            </FormField>
            <FormField
              control={form.control}
              name="banheiros"
              label="Banheiros"
              className="sm:col-span-1"
            >
              {(field) => (
                <NumberInput
                  {...field}
                  id="banheiros"
                  min={0}
                  onChange={(v) => field.onChange(v ?? 0)}
                />
              )}
            </FormField>
            <FormField control={form.control} name="vagas" label="Vagas" className="sm:col-span-1">
              {(field) => (
                <NumberInput
                  {...field}
                  id="vagas"
                  min={0}
                  onChange={(v) => field.onChange(v ?? 0)}
                />
              )}
            </FormField>
            <FormField
              control={form.control}
              name="areaM2"
              label="Área (m²)"
              className="sm:col-span-2"
            >
              {(field) => <NumberInput {...field} id="areaM2" min={0} step="0.01" />}
            </FormField>

            <FormField
              control={form.control}
              name="mobilia"
              label="Mobília"
              className="sm:col-span-2"
            >
              {(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="mobilia" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options(MOBILIA).map((opcao) => (
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
              name="aceitaPet"
              className="sm:col-span-4 sm:self-end"
            >
              {(field) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  Aceita animais de estimação
                </label>
              )}
            </FormField>

            <FormField
              control={form.control}
              name="caracteristicas"
              label="Outras características"
              className="sm:col-span-6"
              description="Digite e pressione Enter para adicionar."
            >
              {(field) => <TagsInput value={field.value} onChange={field.onChange} />}
            </FormField>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valores de referência</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 sm:grid-cols-3">
            <FormField control={form.control} name="valorAluguel" label="Aluguel sugerido">
              {(field) => <MoneyInput {...field} id="valorAluguel" />}
            </FormField>
            <FormField control={form.control} name="valorCondominio" label="Condomínio (mês)">
              {(field) => <MoneyInput {...field} id="valorCondominio" />}
            </FormField>
            <FormField control={form.control} name="valorIptuAnual" label="IPTU (ano)">
              {(field) => <MoneyInput {...field} id="valorIptuAnual" />}
            </FormField>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentação e consumo</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 sm:grid-cols-4">
            <FormField
              control={form.control}
              name="matricula"
              label="Matrícula"
              className="sm:col-span-2"
            >
              {(field) => <Input {...field} id="matricula" />}
            </FormField>
            <FormField
              control={form.control}
              name="inscricaoIptu"
              label="Inscrição do IPTU"
              className="sm:col-span-2"
            >
              {(field) => <Input {...field} id="inscricaoIptu" />}
            </FormField>
            <FormField
              control={form.control}
              name="instalacaoAgua"
              label="Instalação de água"
              className="sm:col-span-2"
            >
              {(field) => <Input {...field} id="instalacaoAgua" />}
            </FormField>
            <FormField
              control={form.control}
              name="instalacaoEnergia"
              label="Instalação de energia"
              className="sm:col-span-2"
            >
              {(field) => <Input {...field} id="instalacaoEnergia" />}
            </FormField>
            <FormField
              control={form.control}
              name="descricao"
              label="Descrição"
              className="sm:col-span-4"
            >
              {(field) => (
                <Textarea
                  {...field}
                  id="descricao"
                  rows={3}
                  placeholder="Como o imóvel é, o que tem de diferente..."
                />
              )}
            </FormField>
            <FormField
              control={form.control}
              name="observacoes"
              label="Observações internas"
              className="sm:col-span-4"
              description="Visível apenas para a equipe."
            >
              {(field) => <Textarea {...field} id="observacoes" rows={2} />}
            </FormField>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <Button type="button" variant="outline" asChild>
          <Link href={imovelId ? `/imoveis/${imovelId}` : "/imoveis"}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner /> : <SaveIcon />}
          {imovelId ? "Salvar alterações" : "Cadastrar imóvel"}
        </Button>
      </div>
    </form>
  );
}

function TagsInput({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [texto, setTexto] = React.useState("");

  function adicionar() {
    const novo = texto.trim();
    if (!novo || value.includes(novo)) return setTexto("");
    onChange([...value, novo]);
    setTexto("");
  }

  return (
    <div className="space-y-2">
      <Input
        value={texto}
        placeholder="Ar-condicionado, churrasqueira, portão eletrônico..."
        onChange={(event) => setTexto(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            adicionar();
          }
        }}
        onBlur={adicionar}
      />
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <li key={item}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {item}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remover ${item}`}
                  onClick={() => onChange(value.filter((v) => v !== item))}
                >
                  <XIcon />
                </Button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
