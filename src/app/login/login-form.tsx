"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
  rememberMe: z.boolean(),
});

type Values = z.infer<typeof schema>;

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [erro, setErro] = React.useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  async function onSubmit(values: Values) {
    setErro(null);
    const { error } = await authClient.signIn.email(values);
    if (error) {
      setErro(
        error.status === 401 || error.status === 403
          ? (error.message ?? "E-mail ou senha incorretos.")
          : "Não foi possível entrar. Tente novamente em instantes.",
      );
      return;
    }
    router.push(next?.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Use o e-mail e a senha cadastrados.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-5">
            <FormField control={form.control} name="email" label="E-mail">
              {(field) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="voce@exemplo.com.br"
                />
              )}
            </FormField>

            <FormField control={form.control} name="password" label="Senha">
              {(field) => (
                <Input {...field} id="password" type="password" autoComplete="current-password" />
              )}
            </FormField>

            <FormField control={form.control} name="rememberMe">
              {(field) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  Manter conectado
                </label>
              )}
            </FormField>

            {erro && (
              <p role="alert" className="text-sm text-destructive">
                {erro}
              </p>
            )}

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Spinner /> : <LogInIcon />}
              Entrar
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
