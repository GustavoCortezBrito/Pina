"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLinkIcon, SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { applyServerErrors, FormField } from "@/components/shared/form-field";
import { useAction } from "@/components/shared/use-action";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { salvarSite } from "../actions";
import { siteSchema, type Site } from "../schemas";

export function SiteForm({ valores }: { valores: Site }) {
  const { pending, run } = useAction();
  const form = useForm<Site>({ resolver: zodResolver(siteSchema), defaultValues: valores });

  async function onSubmit(dados: Site) {
    const result = await run(() => salvarSite(dados), { refresh: false });
    if (!result.ok) applyServerErrors(form, result);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <p className="text-sm text-muted-foreground">
        Dados da vitrine pública de imóveis. Para um imóvel aparecer lá, abra o imóvel e clique em
        <strong> Publicar no site</strong> (ele também precisa estar com a situação “Disponível”).
      </p>
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="whatsapp"
          label="WhatsApp para contato"
          description="Com 55 + DDD, só números. Ex.: 5517996461102"
        >
          {(field) => <Input {...field} id="site-whatsapp" inputMode="numeric" />}
        </FormField>
        <FormField
          control={form.control}
          name="chamada"
          label="Frase de apresentação"
          description="Aparece no topo da vitrine."
          className="sm:col-span-2"
        >
          {(field) => <Input {...field} id="site-chamada" />}
        </FormField>
      </FieldGroup>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner /> : <SaveIcon />}
          Salvar
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href="/vitrine" target="_blank" rel="noreferrer">
            <ExternalLinkIcon /> Ver a vitrine
          </a>
        </Button>
      </div>
    </form>
  );
}
