"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { useAction } from "@/components/shared/use-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Finalidade } from "@/generated/prisma/enums";
import { excluirModeloContrato, salvarModeloContrato } from "../actions";

export type Modelo = { id: string; nome: string; finalidade: Finalidade; conteudo: string; padrao: boolean };

export function ModelosContrato({ modelos }: { modelos: Modelo[] }) {
  const { pending, run } = useAction();
  const [editando, setEditando] = React.useState<Modelo | null>(null);
  const [form, setForm] = React.useState({ nome: "", finalidade: "RESIDENCIAL" as Finalidade, conteudo: "" });

  function abrirNovo() {
    setForm({ nome: "", finalidade: "RESIDENCIAL", conteudo: "" });
    setEditando({ id: "", nome: "", finalidade: "RESIDENCIAL", conteudo: "", padrao: false });
  }

  function abrirEdicao(modelo: Modelo) {
    setForm({ nome: modelo.nome, finalidade: modelo.finalidade, conteudo: modelo.conteudo });
    setEditando(modelo);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={abrirNovo}>
          <PlusIcon /> Novo modelo
        </Button>
      </div>

      <div className="space-y-3">
        {modelos.map((modelo) => (
          <Card key={modelo.id}>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {modelo.nome} {modelo.padrao && <Badge variant="secondary">Padrão</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">{modelo.finalidade}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => abrirEdicao(modelo)} aria-label="Editar">
                  <PencilIcon />
                </Button>
                <ConfirmAction
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Excluir">
                      <Trash2Icon />
                    </Button>
                  }
                  titulo="Excluir modelo?"
                  descricao="Só é possível excluir modelos que não estão em uso por nenhum contrato."
                  confirmLabel="Excluir"
                  action={excluirModeloContrato.bind(null, modelo.id)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editando != null} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent className="max-w-2xl!">
          <DialogHeader>
            <DialogTitle>{editando?.id ? "Editar modelo" : "Novo modelo"}</DialogTitle>
            <DialogDescription>
              Use variáveis como <code>{"{{locatario.nome}}"}</code> e <code>{"{{imovel.endereco}}"}</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Nome do modelo"
                className="flex-1"
              />
              <Select
                value={form.finalidade}
                onValueChange={(v) => setForm((f) => ({ ...f, finalidade: v as Finalidade }))}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESIDENCIAL">Residencial</SelectItem>
                  <SelectItem value="COMERCIAL">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={form.conteudo}
              onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
              rows={16}
              className="font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button
              disabled={pending}
              onClick={async () => {
                const result = await run(() => salvarModeloContrato(editando?.id || null, form));
                if (result.ok) setEditando(null);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
