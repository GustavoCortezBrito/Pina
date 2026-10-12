import "dotenv/config";
import { randomBytes } from "node:crypto";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

const [nome, email, papel = "operador"] = process.argv.slice(2);
const PAPEIS = ["admin", "gerente", "operador", "site"];

if (!nome || !email || !PAPEIS.includes(papel)) {
  console.error('Uso: npm run usuario:criar -- "Nome Completo" email@exemplo.com [admin|gerente|operador|site]');
  process.exit(1);
}

const existente = await db.user.findUnique({ where: { email: email.toLowerCase() } });
if (existente) {
  console.error(`${email} já existe (papel: ${existente.role}). Nada foi alterado.`);
  process.exit(1);
}

const alfabeto = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const senha = Array.from(randomBytes(14), (b) => alfabeto[b % alfabeto.length]).join("");

await auth.api.createUser({ body: { name: nome, email: email.toLowerCase(), password: senha, role: papel as "admin" } });
console.log(`✓ Usuário criado: ${nome} <${email}> (${papel})`);
console.log(`  Senha temporária: ${senha}`);
console.log("  Peça para trocar em Meu perfil no primeiro acesso.");
process.exit(0);
