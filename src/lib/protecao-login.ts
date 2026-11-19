/**
 * Proteção contra tentativa de adivinhar a senha de uma conta. O limite por endereço (5 por minuto)
 * já barra um computador sozinho; esta trava olha a CONTA, para o caso de vários endereços atacando
 * o mesmo e-mail. Fica na memória do processo (o sistema roda num processo só).
 *
 * Para um invasor não conseguir trancar o dono de fora de propósito, quem entrou com sucesso
 * recentemente por um endereço continua podendo tentar a partir dele.
 */
export type OpcoesProtecao = {
  /** Falhas dentro da janela que disparam o bloqueio. */
  maxFalhas?: number;
  janelaMs?: number;
  bloqueioMs?: number;
  /** Quantos endereços "de confiança" lembrar por conta. */
  maxEnderecos?: number;
  maxContas?: number;
  agora?: () => number;
};

type Conta = { falhas: number[]; bloqueadoAte: number; enderecos: string[] };

export function criarProtecaoLogin(opcoes: OpcoesProtecao = {}) {
  const {
    maxFalhas = 10,
    janelaMs = 15 * 60_000,
    bloqueioMs = 10 * 60_000,
    maxEnderecos = 5,
    maxContas = 5000,
    agora = Date.now,
  } = opcoes;
  const contas = new Map<string, Conta>();

  const normalizar = (email: string) => email.trim().toLowerCase().slice(0, 200);

  function limpar() {
    const t = agora();
    for (const [chave, c] of contas) {
      c.falhas = c.falhas.filter((x) => t - x < janelaMs);
      if (c.falhas.length === 0 && c.bloqueadoAte <= t && c.enderecos.length === 0) contas.delete(chave);
    }
    // Se ainda passar do teto (ataque com milhares de e-mails diferentes), descarta as mais antigas.
    while (contas.size > maxContas) {
      const primeira = contas.keys().next().value;
      if (primeira === undefined) break;
      contas.delete(primeira);
    }
  }

  function obter(chave: string) {
    let c = contas.get(chave);
    if (!c) {
      if (contas.size >= maxContas) limpar();
      c = { falhas: [], bloqueadoAte: 0, enderecos: [] };
      contas.set(chave, c);
    }
    return c;
  }

  return {
    /** A conta está bloqueada para este endereço? */
    verificar(email: string, endereco?: string | null) {
      const c = contas.get(normalizar(email));
      const t = agora();
      if (!c || c.bloqueadoAte <= t) return { bloqueado: false, segundos: 0 };
      if (endereco && c.enderecos.includes(endereco)) return { bloqueado: false, segundos: 0 };
      return { bloqueado: true, segundos: Math.ceil((c.bloqueadoAte - t) / 1000) };
    },

    /** Registra uma senha errada. `bloqueouAgora` só é verdadeiro na tentativa que dispara o bloqueio. */
    falhou(email: string) {
      const c = obter(normalizar(email));
      const t = agora();
      c.falhas = c.falhas.filter((x) => t - x < janelaMs);
      c.falhas.push(t);
      const bloqueouAgora = c.falhas.length >= maxFalhas && c.bloqueadoAte <= t;
      if (bloqueouAgora) c.bloqueadoAte = t + bloqueioMs;
      return { total: c.falhas.length, bloqueouAgora };
    },

    /** Entrada bem-sucedida: zera as falhas e passa a confiar nesse endereço para esta conta. */
    sucesso(email: string, endereco?: string | null) {
      const c = obter(normalizar(email));
      c.falhas = [];
      c.bloqueadoAte = 0;
      if (endereco) {
        c.enderecos = [endereco, ...c.enderecos.filter((e) => e !== endereco)].slice(0, maxEnderecos);
      }
    },
  };
}

export type ProtecaoLogin = ReturnType<typeof criarProtecaoLogin>;
