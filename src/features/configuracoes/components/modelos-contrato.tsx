"use client";

import { DownloadIcon, PencilIcon, PlusIcon, StarIcon, Trash2Icon, UploadIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeloEditor } from "./modelo-editor";
import type { Finalidade } from "@/generated/prisma/enums";
import {
  criarModeloArquivo,
  definirModeloPadrao,
  excluirModeloContrato,
  salvarModeloContrato,
} from "../actions";

export type Modelo = {
  id: string;
  nome: string;
  finalidade: Finalidade;
  conteudo: string | null;
  padrao: boolean;
  arquivos: { id: string; nomeOriginal: string }[];
};

export function ModelosContrato({ modelos }: { modelos: Modelo[] }) {
  const { pending, run } = useAction();
  const [editando, setEditando] = React.useState<Modelo | null>(null);
  const [novoAberto, setNovoAberto] = React.useState(false);
  const [form, setForm] = React.useState({ nome: "", finalidade: "RESIDENCIAL" as Finalidade, conteudo: "" });

  function abrirEdicao(modelo: Modelo) {
    setForm({ nome: modelo.nome, finalidade: modelo.finalidade, conteudo: modelo.conteudo ?? "" });
    setEditando(modelo);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setNovoAberto(true)}>
          <PlusIcon /> Novo modelo
        </Button>
      </div>

      <div className="space-y-3">
        {modelos.map((modelo) => {
          const arquivo = modelo.arquivos[0];
          return (
            <Card key={modelo.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {modelo.nome} {modelo.padrao && <Badge variant="secondary">Padrão</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {modelo.finalidade} · {arquivo ? "Arquivo enviado" : "Texto com variáveis"}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!modelo.padrao && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Tornar padrão"
                      title="Tornar padrão"
                      disabled={pending}
                      onClick={() => run(() => definirModeloPadrao(modelo.id))}
                    >
                      <StarIcon />
                    </Button>
                  )}
                  {arquivo ? (
                    <Button variant="ghost" size="icon-sm" aria-label="Baixar arquivo" asChild>
                      <a href={`/api/arquivos/${arquivo.id}?download=1`} target="_blank" rel="noreferrer">
                        <DownloadIcon />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => abrirEdicao(modelo)}
                      aria-label="Editar"
                    >
                      <PencilIcon />
                    </Button>
                  )}
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
          );
        })}
      </div>

      {/* Editar modelo de texto existente */}
      <Dialog open={editando != null} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar modelo</DialogTitle>
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
            <ModeloEditor value={form.conteudo} onChange={(conteudo) => setForm((f) => ({ ...f, conteudo }))} />
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

      <NovoModeloDialog open={novoAberto} onOpenChange={setNovoAberto} />
    </div>
  );
}

function NovoModeloDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { pending, run } = useAction();
  const [tipo, setTipo] = React.useState<"texto" | "arquivo">("texto");
  const [textoForm, setTextoForm] = React.useState({ nome: "", finalidade: "RESIDENCIAL" as Finalidade, conteudo: "" });
  const [arquivoForm, setArquivoForm] = React.useState<{ nome: string; finalidade: Finalidade; arquivo: File | null }>(
    { nome: "", finalidade: "RESIDENCIAL", arquivo: null },
  );

  function fechar(ok: boolean) {
    if (ok) {
      setTextoForm({ nome: "", finalidade: "RESIDENCIAL", conteudo: "" });
      setArquivoForm({ nome: "", finalidade: "RESIDENCIAL", arquivo: null });
      setTipo("texto");
    }
    onOpenChange(false);
  }

  async function salvar() {
    if (tipo === "texto") {
      const result = await run(() => salvarModeloContrato(null, textoForm));
      if (result.ok) fechar(true);
      return;
    }
    if (!arquivoForm.arquivo) return;
    const formData = new FormData();
    formData.set("nome", arquivoForm.nome);
    formData.set("finalidade", arquivoForm.finalidade);
    formData.set("arquivo", arquivoForm.arquivo);
    const result = await run(() => criarModeloArquivo(formData));
    if (result.ok) fechar(true);
  }

  const podeSalvar = tipo === "texto" ? textoForm.nome.trim() && textoForm.conteudo.trim() : arquivoForm.nome.trim() && arquivoForm.arquivo;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && fechar(false)}>
      <DialogContent className="max-h-[92vh] max-w-5xl! overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo modelo de contrato</DialogTitle>
          <DialogDescription>Escreva um modelo com variáveis ou envie um arquivo já pronto.</DialogDescription>
        </DialogHeader>

        <Tabs value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
          <TabsList>
            <TabsTrigger value="texto">
              <PencilIcon /> Escrever modelo
            </TabsTrigger>
            <TabsTrigger value="arquivo">
              <UploadIcon /> Enviar arquivo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="texto" className="space-y-3">
            <div className="flex gap-3">
              <Input
                value={textoForm.nome}
                onChange={(e) => setTextoForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Nome do modelo"
                className="flex-1"
              />
              <Select
                value={textoForm.finalidade}
                onValueChange={(v) => setTextoForm((f) => ({ ...f, finalidade: v as Finalidade }))}
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
            <p className="text-xs text-muted-foreground">
              Use variáveis como <code>{"{{locatario.nome}}"}</code> e <code>{"{{imovel.endereco}}"}</code>. O PDF
              é gerado automaticamente com elas já preenchidas.
            </p>
            <ModeloEditor
              value={textoForm.conteudo}
              onChange={(conteudo) => setTextoForm((f) => ({ ...f, conteudo }))}
            />
          </TabsContent>

          <TabsContent value="arquivo" className="space-y-3">
            <div className="flex gap-3">
              <Input
                value={arquivoForm.nome}
                onChange={(e) => setArquivoForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Nome do modelo"
                className="flex-1"
              />
              <Select
                value={arquivoForm.finalidade}
                onValueChange={(v) => setArquivoForm((f) => ({ ...f, finalidade: v as Finalidade }))}
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
            <Input
              type="file"
              accept="application/pdf,.doc,.docx,.odt"
              onChange={(e) => setArquivoForm((f) => ({ ...f, arquivo: e.target.files?.[0] ?? null }))}
            />
            <p className="text-xs text-muted-foreground">
              PDF ou Word (doc/docx/odt), até 25 MB. Esse modelo fica disponível para download/uso manual — as
              variáveis não são preenchidas automaticamente nele.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => fechar(false)}>
            Cancelar
          </Button>
          <Button disabled={pending || !podeSalvar} onClick={salvar}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
