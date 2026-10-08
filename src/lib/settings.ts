import "server-only";
import { cache } from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_SCHEMAS,
  type Settings,
  type SettingsKey,
} from "@/features/configuracoes/schemas";
import { db } from "@/lib/db";

/** Configurações gravadas no banco, completadas com os valores padrão. */
export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.configuracao.findMany();
  const settings = structuredClone(DEFAULT_SETTINGS);
  for (const row of rows) {
    const key = row.chave as SettingsKey;
    const schema = SETTINGS_SCHEMAS[key];
    if (!schema) continue;
    const parsed = schema.safeParse({ ...DEFAULT_SETTINGS[key], ...(row.valor as object) });
    if (parsed.success) Object.assign(settings[key], parsed.data);
  }
  return settings;
});

export async function saveSettings<K extends SettingsKey>(key: K, value: Settings[K]) {
  const data = SETTINGS_SCHEMAS[key].parse(value);
  await db.configuracao.upsert({
    where: { chave: key },
    create: { chave: key, valor: data },
    update: { valor: data },
  });
}
