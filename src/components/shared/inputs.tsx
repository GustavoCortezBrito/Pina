"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { formatCEP, formatDocumento, formatPhone } from "@/lib/format";
import { normalizeDocumento, onlyDigits } from "@/lib/validators";

type BaseProps = Omit<React.ComponentProps<"input">, "value" | "onChange">;

/**
 * Entrada de dinheiro no formato brasileiro: o usuário digita só números e o valor
 * vai preenchendo os centavos (1300 → 13,00). O estado guarda centavos.
 */
export function MoneyInput({
  value,
  onChange,
  ...props
}: BaseProps & { value: number | null | undefined; onChange: (value: number | null) => void }) {
  const display =
    value == null
      ? ""
      : (value / 100).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  return (
    <InputGroup>
      <InputGroupAddon>R$</InputGroupAddon>
      <InputGroupInput
        {...props}
        inputMode="numeric"
        value={display}
        onChange={(event) => {
          const digits = onlyDigits(event.target.value).slice(0, 12);
          onChange(digits ? Number(digits) : null);
        }}
      />
    </InputGroup>
  );
}

/** Percentual com até 4 casas decimais (usa vírgula como separador). */
export function PercentInput({
  value,
  onChange,
  ...props
}: BaseProps & { value: number | null | undefined; onChange: (value: number | null) => void }) {
  const [text, setText] = React.useState(value == null ? "" : String(value).replace(".", ","));
  const lastValue = React.useRef(value);

  React.useEffect(() => {
    if (lastValue.current !== value) {
      lastValue.current = value;
      setText(value == null ? "" : String(value).replace(".", ","));
    }
  }, [value]);

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        inputMode="decimal"
        value={text}
        onChange={(event) => {
          const raw = event.target.value.replace(/[^\d,.-]/g, "");
          setText(raw);
          const parsed = Number(raw.replace(",", "."));
          const next = raw === "" ? null : Number.isFinite(parsed) ? parsed : null;
          lastValue.current = next;
          onChange(next);
        }}
      />
      <InputGroupAddon align="inline-end">%</InputGroupAddon>
    </InputGroup>
  );
}

/** Campo numérico inteiro (quartos, vagas, prazo...). */
export function NumberInput({
  value,
  onChange,
  ...props
}: BaseProps & { value: number | null | undefined; onChange: (value: number | null) => void }) {
  return (
    <Input
      {...props}
      type="number"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
    />
  );
}

type MaskedProps = BaseProps & {
  value: string | null | undefined;
  onChange: (value: string) => void;
};

/** CPF ou CNPJ (inclusive o alfanumérico). Guarda o documento sem pontuação. */
export function DocumentoInput({ value, onChange, ...props }: MaskedProps) {
  return (
    <Input
      {...props}
      value={formatDocumento(value ?? "") === "—" ? "" : formatDocumento(value ?? "")}
      onChange={(event) => onChange(normalizeDocumento(event.target.value).slice(0, 14))}
      placeholder={props.placeholder ?? "000.000.000-00"}
    />
  );
}

/** Telefone com DDD. Guarda só os dígitos. */
export function PhoneInput({ value, onChange, ...props }: MaskedProps) {
  return (
    <Input
      {...props}
      inputMode="tel"
      value={formatPhone(value ?? "")}
      onChange={(event) => onChange(onlyDigits(event.target.value).slice(0, 11))}
      placeholder={props.placeholder ?? "(17) 99999-9999"}
    />
  );
}

/** CEP. Guarda só os dígitos. */
export function CepInput({ value, onChange, ...props }: MaskedProps) {
  return (
    <Input
      {...props}
      inputMode="numeric"
      value={formatCEP(value ?? "")}
      onChange={(event) => onChange(onlyDigits(event.target.value).slice(0, 8))}
      placeholder={props.placeholder ?? "00000-000"}
    />
  );
}
