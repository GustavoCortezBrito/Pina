-- AlterEnum
ALTER TYPE "CategoriaArquivo" ADD VALUE 'FOTO_PERFIL';

-- AlterTable
ALTER TABLE "Arquivo" ADD COLUMN     "usuarioId" TEXT;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
