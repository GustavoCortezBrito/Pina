-- AlterTable
ALTER TABLE "Imovel" ADD COLUMN     "publicadoEm" TIMESTAMP(3),
ADD COLUMN     "publicadoNoSite" BOOLEAN NOT NULL DEFAULT false;
