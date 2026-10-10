-- AlterTable
ALTER TABLE "Arquivo" ADD COLUMN     "modeloContratoId" TEXT;

-- AlterTable
ALTER TABLE "ModeloContrato" ALTER COLUMN "conteudo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_modeloContratoId_fkey" FOREIGN KEY ("modeloContratoId") REFERENCES "ModeloContrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
