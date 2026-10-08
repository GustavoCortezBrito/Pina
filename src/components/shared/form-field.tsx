"use client";

import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormSetError,
} from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

type FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> = {
  control: Control<TValues>;
  name: TName;
  label?: string;
  description?: string;
  className?: string;
  children: (field: ControllerRenderProps<TValues, TName>, invalid: boolean) => React.ReactNode;
};

/** Liga um campo do react-hook-form aos componentes Field do shadcn/ui. */
export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  control,
  name,
  label,
  description,
  className,
  children,
}: FormFieldProps<TValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className={className} data-invalid={fieldState.invalid || undefined}>
          {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
          {children(field, fieldState.invalid)}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

/** Repassa os erros de validação devolvidos pelo servidor para os campos do formulário. */
export function applyServerErrors<TValues extends FieldValues>(
  form: { setError: UseFormSetError<TValues> },
  result: { fieldErrors?: Record<string, string[]> },
) {
  for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
    if (messages[0]) form.setError(name as FieldPath<TValues>, { message: messages[0] });
  }
}
