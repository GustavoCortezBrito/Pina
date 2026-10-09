"use client";

import * as React from "react";
import type { Control, FieldPath, FieldValues, UseFormSetValue } from "react-hook-form";
import { FormField } from "@/components/shared/form-field";
import { CepInput } from "@/components/shared/inputs";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { UFS } from "@/lib/ufs";

type ViaCep = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

/**
 * Bloco de endereço reaproveitado por imóveis, pessoas e empreendimentos.
 * O formulário precisa ter os campos cep, logradouro, numero, complemento, bairro, cidade e uf.
 */
export function AddressFields<T extends FieldValues>({
  control,
  setValue,
  comComplemento = true,
}: {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  comComplemento?: boolean;
}) {
  const [buscando, setBuscando] = React.useState(false);
  const campo = (nome: string) => nome as FieldPath<T>;

  async function buscarCep(cep: string) {
    if (cep.length !== 8) return;
    setBuscando(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = (await response.json()) as ViaCep;
      if (data.erro) return;
      const preencher = (nome: string, valor?: string) => {
        if (valor) setValue(campo(nome), valor as never, { shouldDirty: true });
      };
      preencher("logradouro", data.logradouro);
      preencher("bairro", data.bairro);
      preencher("cidade", data.localidade);
      preencher("uf", data.uf);
    } catch {
      // Sem internet ou CEP fora do ar: o usuário preenche na mão.
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-6">
      <FormField
        control={control}
        name={campo("cep")}
        label="CEP"
        className="sm:col-span-2"
        description={buscando ? undefined : "Preenche o endereço automaticamente."}
      >
        {(field) => (
          <div className="flex items-center gap-2">
            <CepInput
              {...field}
              id="cep"
              value={field.value as string}
              onChange={(valor) => {
                field.onChange(valor);
                void buscarCep(valor);
              }}
            />
            {buscando && <Spinner className="size-4 text-muted-foreground" />}
          </div>
        )}
      </FormField>

      <FormField
        control={control}
        name={campo("logradouro")}
        label="Rua / Avenida"
        className="sm:col-span-4"
      >
        {(field) => <Input {...field} id="logradouro" value={(field.value as string) ?? ""} />}
      </FormField>

      <FormField control={control} name={campo("numero")} label="Número" className="sm:col-span-2">
        {(field) => <Input {...field} id="numero" value={(field.value as string) ?? ""} />}
      </FormField>

      {comComplemento && (
        <FormField
          control={control}
          name={campo("complemento")}
          label="Complemento"
          className="sm:col-span-4"
        >
          {(field) => (
            <Input
              {...field}
              id="complemento"
              value={(field.value as string) ?? ""}
              placeholder="Apto 02, fundos..."
            />
          )}
        </FormField>
      )}

      <FormField control={control} name={campo("bairro")} label="Bairro" className="sm:col-span-2">
        {(field) => <Input {...field} id="bairro" value={(field.value as string) ?? ""} />}
      </FormField>

      <FormField control={control} name={campo("cidade")} label="Cidade" className="sm:col-span-3">
        {(field) => <Input {...field} id="cidade" value={(field.value as string) ?? ""} />}
      </FormField>

      <FormField control={control} name={campo("uf")} label="UF" className="sm:col-span-1">
        {(field) => (
          <Input
            {...field}
            id="uf"
            maxLength={2}
            list="ufs"
            className="uppercase"
            value={(field.value as string) ?? ""}
            onChange={(event) => field.onChange(event.target.value.toUpperCase())}
          />
        )}
      </FormField>
      <datalist id="ufs">
        {UFS.map((uf) => (
          <option key={uf} value={uf} />
        ))}
      </datalist>
    </div>
  );
}
