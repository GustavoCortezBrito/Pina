import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/** Onde os arquivos ficam guardados. Hoje só há o disco local; um adaptador S3/MinIO pode entrar aqui. */
export interface StorageProvider {
  save(key: string, data: Buffer): Promise<void>;
  read(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

class LocalStorage implements StorageProvider {
  constructor(private readonly root: string) {}

  private resolve(key: string) {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error("Caminho de arquivo inválido.");
    return full;
  }

  async save(key: string, data: Buffer) {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
  }

  read(key: string) {
    return readFile(this.resolve(key));
  }

  async remove(key: string) {
    await rm(this.resolve(key), { force: true });
  }
}

// turbopackIgnore: evita que o build rastreie o projeto inteiro por causa de um caminho dinâmico.
export const storage: StorageProvider = new LocalStorage(
  path.resolve(/* turbopackIgnore: true */ process.env.STORAGE_LOCAL_PATH || "./storage/uploads"),
);
