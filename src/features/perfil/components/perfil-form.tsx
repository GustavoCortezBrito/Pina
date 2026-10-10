"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, SaveIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const dadosSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
});

const senhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual."),
    novaSenha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmarSenha: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

type DadosValues = z.infer<typeof dadosSchema>;
type SenhaValues = z.infer<typeof senhaSchema>;

export function PerfilForm({ nome, email, perfil }: { nome: string; email: string; perfil: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-4" /> Meus dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <DadosForm nome={nome} />
          <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">E-mail</p>
              <p className="text-sm">{email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Perfil de acesso</p>
              <Badge variant="secondary">{perfil}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-4" /> Alterar senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SenhaForm />
        </CardContent>
      </Card>
    </div>
  );
}

function DadosForm({ nome }: { nome: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const form = useForm<DadosValues>({ resolver: zodResolver(dadosSchema), defaultValues: { nome } });

  async function onSubmit(dados: DadosValues) {
    setPending(true);
    const { error } = await authClient.updateUser({ name: dados.nome });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "Não foi possível salvar.");
      return;
    }
    toast.success("Nome atualizado.");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-3" noValidate>
      <FormField control={form.control} name="nome" label="Nome" className="flex-1">
        {(field) => <Input {...field} id="nome" />}
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : <SaveIcon />}
        Salvar
      </Button>
    </form>
  );
}

function SenhaForm() {
  const [pending, setPending] = React.useState(false);
  const form = useForm<SenhaValues>({
    resolver: zodResolver(senhaSchema),
    defaultValues: { senhaAtual: "", novaSenha: "", confirmarSenha: "" },
  });

  async function onSubmit(dados: SenhaValues) {
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: dados.senhaAtual,
      newPassword: dados.novaSenha,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) {
      toast.error(
        error.status === 400 || error.status === 401
          ? "Senha atual incorreta."
          : (error.message ?? "Não foi possível trocar a senha."),
      );
      return;
    }
    toast.success("Senha alterada.");
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="senhaAtual"
          label="Senha atual"
          className="sm:col-span-2"
        >
          {(field) => <Input {...field} id="senhaAtual" type="password" autoComplete="current-password" />}
        </FormField>
        <FormField control={form.control} name="novaSenha" label="Nova senha">
          {(field) => <Input {...field} id="novaSenha" type="password" autoComplete="new-password" />}
        </FormField>
        <FormField control={form.control} name="confirmarSenha" label="Confirmar nova senha">
          {(field) => <Input {...field} id="confirmarSenha" type="password" autoComplete="new-password" />}
        </FormField>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : <KeyRoundIcon />}
        Trocar senha
      </Button>
    </form>
  );
}
