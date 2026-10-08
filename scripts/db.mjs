#!/usr/bin/env node
// PostgreSQL embutido para desenvolvimento — sem Docker e sem instalar nada.
// Usa os binários do pacote `embedded-postgres` e roda o servidor em segundo plano.
//
//   node scripts/db.mjs start    inicializa (1ª vez), sobe o servidor e cria o banco
//   node scripts/db.mjs stop     para o servidor
//   node scripts/db.mjs status   mostra se está rodando
//
// Configuração via .env: DATABASE_URL (usuário, senha, porta e nome do banco),
// PGDATA_DIR (pasta dos dados) e EMBEDDED_POSTGRES=false (para desativar).

import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { arch, homedir, platform, tmpdir } from "node:os";
import path from "node:path";
import "dotenv/config";
import pg from "pg";

const PACKAGES = {
  "win32-x64": "@embedded-postgres/windows-x64",
  "darwin-arm64": "@embedded-postgres/darwin-arm64",
  "darwin-x64": "@embedded-postgres/darwin-x64",
  "linux-x64": "@embedded-postgres/linux-x64",
  "linux-arm64": "@embedded-postgres/linux-arm64",
};

const command = process.argv[2] ?? "start";

if (process.env.EMBEDDED_POSTGRES === "false") {
  console.log("[db] EMBEDDED_POSTGRES=false — usando o banco configurado em DATABASE_URL.");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error("[db] DATABASE_URL não definida. Copie .env.example para .env.");
  process.exit(1);
}

const url = new URL(process.env.DATABASE_URL);
const cfg = {
  host: url.hostname,
  port: Number(url.port || 5432),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  dataDir: path.resolve(process.env.PGDATA_DIR || path.join(homedir(), ".pinasystem", "postgres")),
};
const logFile = path.join(path.dirname(cfg.dataDir), "postgres.log");

if (!["localhost", "127.0.0.1"].includes(cfg.host)) {
  console.log(`[db] DATABASE_URL aponta para ${cfg.host}; o Postgres embutido não será usado.`);
  process.exit(0);
}

async function binaries() {
  const pkg = PACKAGES[`${platform()}-${arch()}`];
  if (!pkg) throw new Error(`Plataforma não suportada pelo Postgres embutido: ${platform()}-${arch()}`);
  return import(pkg);
}

function run(bin, args, options = {}) {
  const result = spawnSync(bin, args, { encoding: "utf8", windowsHide: true, ...options });
  if (result.error) throw result.error;
  return result;
}

function isInitialised() {
  return existsSync(path.join(cfg.dataDir, "PG_VERSION"));
}

function isRunning(bin) {
  if (!isInitialised()) return false;
  return run(bin.pg_ctl, ["status", "-D", cfg.dataDir]).status === 0;
}

function initialise(bin) {
  console.log(`[db] Criando cluster em ${cfg.dataDir} ...`);
  mkdirSync(path.dirname(cfg.dataDir), { recursive: true });
  const pwfile = path.join(tmpdir(), `pinasystem-pg-${randomBytes(6).toString("hex")}`);
  writeFileSync(pwfile, `${cfg.password}\n`);
  try {
    const result = run(bin.initdb, [
      `--pgdata=${cfg.dataDir}`,
      `--username=${cfg.user}`,
      `--pwfile=${pwfile}`,
      "--auth=scram-sha-256",
      "--encoding=UTF8",
      "--locale=C",
      "--locale-provider=builtin",
      "--builtin-locale=C.UTF-8",
    ]);
    if (result.status !== 0) {
      throw new Error(`initdb falhou:\n${result.stdout}\n${result.stderr}`);
    }
  } finally {
    rmSync(pwfile, { force: true });
  }
}

function startServer(bin) {
  // Processo destacado: o banco continua rodando mesmo após Ctrl+C no `next dev`.
  return new Promise((resolve, reject) => {
    const child = spawn(
      bin.pg_ctl,
      [
        "start",
        "-D",
        cfg.dataDir,
        "-l",
        logFile,
        "-w",
        "-t",
        "60",
        "-o",
        `-p ${cfg.port} -c listen_addresses=localhost`,
      ],
      { detached: true, stdio: "ignore", windowsHide: true },
    );
    child.on("error", reject);
    // pg_ctl -w só termina quando o servidor já aceita conexões.
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`pg_ctl start terminou com código ${code}. Veja o log: ${logFile}`)),
    );
  });
}

async function ensureDatabase() {
  const client = new pg.Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: "postgres",
  });
  await client.connect();
  try {
    const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [cfg.database]);
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE ${client.escapeIdentifier(cfg.database)}`);
      console.log(`[db] Banco "${cfg.database}" criado.`);
    }
  } finally {
    await client.end();
  }
}

async function main() {
  const bin = await binaries();

  switch (command) {
    case "start": {
      if (!isInitialised()) initialise(bin);
      if (isRunning(bin)) {
        console.log(`[db] Postgres já está rodando na porta ${cfg.port}.`);
      } else {
        await startServer(bin);
        console.log(`[db] Postgres iniciado na porta ${cfg.port} (log: ${logFile}).`);
      }
      await ensureDatabase();
      break;
    }
    case "stop": {
      if (!isRunning(bin)) {
        console.log("[db] Postgres não está rodando.");
        break;
      }
      const result = run(bin.pg_ctl, ["stop", "-D", cfg.dataDir, "-m", "fast", "-w"]);
      if (result.status !== 0) throw new Error(result.stderr || result.stdout);
      console.log("[db] Postgres parado.");
      break;
    }
    case "status": {
      const running = isRunning(bin);
      console.log(
        running
          ? `[db] Rodando na porta ${cfg.port} — dados em ${cfg.dataDir}`
          : `[db] Parado — dados em ${cfg.dataDir}${isInitialised() ? "" : " (ainda não inicializado)"}`,
      );
      break;
    }
    default:
      console.error(`[db] Comando desconhecido: ${command}. Use start, stop ou status.`);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(`[db] ${error.message}`);
  process.exit(1);
});
