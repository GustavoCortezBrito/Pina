-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN     "importado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numeroOriginal" TEXT,
ADD COLUMN     "reajustesAnteriores" INTEGER NOT NULL DEFAULT 0;
