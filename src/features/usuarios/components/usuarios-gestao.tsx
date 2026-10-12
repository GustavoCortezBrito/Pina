"use client";

import { KeyRoundIcon, PlusIcon, PowerIcon } from "lucide-react";
import * as React from "react";
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
import { ROLE_DESCRIPTION, ROLE_LABEL, type Role, normalizeRole } from "@/lib/permissions";
import {
  alternarUsuarioAtivo,
  alterarPapelUsuario,
  criarUsuario,
  redefinirSenhaUsuario,
} from "../actions";

export type UsuarioItem = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
};

const PAPEIS = Object.keys(ROLE_LABEL) as Role[];

const COR_PAPEL: Record<Role, string> = {
  admin: "bg-primary/20 text-primary-ink",
  gerente: "bg-info/12 text-info ring-1 ring-inset ring-info/30",
  operador: "bg-transparent text-foreground ring-1 ring-inset ring-border",
  site: "bg-muted text-muted-foreground",
};

function SelectPapel({
  value,
  onChange,
  disabled,
}: {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Role)} disabled={disabled}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PAPEIS.map((papel) => (
          <SelectItem key={papel} value={papel}>
            {ROLE_LABEL[papel]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function UsuariosGestao({ usuarios, meuId }: { usuarios: UsuarioItem[]; meuId: string }) {
  const { pending, run } = useAction();
  const [novoAberto, setNovoAberto] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", password: "", role: "operador" as Role });
  const [senhaDe, setSenhaDe] = React.useState<UsuarioItem | null>(null);
  const [novaSenha, setNovaSenha] = React.useState("");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PAPEIS.map((papel) => (
          <Card key={papel}>
            <CardContent className="space-y-1.5">
              <Badge variant="outline" className={`border-transparent font-semibold ${COR_PAPEL[papel]}`}>
                {ROLE_LABEL[papel]}
              </Badge>
              <p className="text-sm text-muted-foreground">{ROLE_DESCRIPTION[papel]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setNovoAberto(true)}>
          <PlusIcon /> Novo usuário
        </Button>
      </div>

      <div className="space-y-3">
        {usuarios.map((u) => {
          const papel = normalizeRole(u.role);
          const sou = u.id === meuId;
          return (
            <Card key={u.id} className={u.banned ? "opacity-60" : undefined}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {u.name} {sou && <Badge variant="secondary">Você</Badge>}{" "}
                    {u.banned && <Badge variant="destructive">Desativado</Badge>}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SelectPapel
                    value={papel}
                    disabled={pending || sou}
                    onChange={(novo) => run(() => alterarPapelUsuario(u.id, novo))}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Redefinir senha"
                    title="Redefinir senha"
                    onClick={() => {
                      setNovaSenha("");
                      setSenhaDe(u);
                    }}
                  >
                    <KeyRoundIcon />
                  </Button>
                  {!sou && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={u.banned ? "Reativar" : "Desativar"}
                      title={u.banned ? "Reativar" : "Desativar"}
                      disabled={pending}
                      onClick={() => run(() => alternarUsuarioAtivo(u.id, !!u.banned))}
                    >
                      <PowerIcon />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={novoAberto} onOpenChange={setNovoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>A pessoa entra com este e-mail e a senha que você definir.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Senha (mín. 8 caracteres)"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <SelectPapel value={form.role} onChange={(role) => setForm((f) => ({ ...f, role }))} />
            <p className="text-sm text-muted-foreground">{ROLE_DESCRIPTION[form.role]}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoAberto(false)}>
              Cancelar
            </Button>
            <Button
              disabled={pending}
              onClick={async () => {
                const result = await run(() => criarUsuario(form));
                if (result.ok) {
                  setNovoAberto(false);
                  setForm({ name: "", email: "", password: "", role: "operador" });
                }
              }}
            >
              Criar usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={senhaDe != null} onOpenChange={(open) => !open && setSenhaDe(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>Nova senha para {senhaDe?.name}.</DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Nova senha (mín. 8 caracteres)"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSenhaDe(null)}>
              Cancelar
            </Button>
            <Button
              disabled={pending || novaSenha.length < 8}
              onClick={async () => {
                if (!senhaDe) return;
                const result = await run(() => redefinirSenhaUsuario(senhaDe.id, novaSenha));
                if (result.ok) setSenhaDe(null);
              }}
            >
              Salvar senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
