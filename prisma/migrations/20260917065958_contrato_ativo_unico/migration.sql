-- RN-01: um imóvel só pode ter um contrato ATIVO por vez.
CREATE UNIQUE INDEX "Contrato_um_ativo_por_imovel" ON "Contrato" ("imovelId") WHERE "status" = 'ATIVO';
