import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import { db } from "../src/lib/db";
import { processImage } from "../src/lib/images";
import { storage } from "../src/lib/storage";

async function main() {
  const pasta = path.resolve(process.cwd(), "ImovelExemplo");
  let nomes: string[] = [];
  try {
    nomes = (await readdir(pasta)).filter((n) => /\.(jpe?g|png|webp)$/i.test(n)).sort();
  } catch {
    console.warn("Pasta ImovelExemplo não encontrada");
  }

  const fotosProcessadas = [];
  for (const nome of nomes) {
    const raw = await readFile(path.join(pasta, nome));
    const info = await processImage(raw);
    fotosProcessadas.push({ nome, ...info });
  }

  const imoveisData = [
    {
      codigo: "VIT-01",
      titulo: "Casa Térrea no Jardim Alvorada",
      tipo: "CASA" as const,
      status: "DISPONIVEL" as const,
      publicadoNoSite: true,
      publicadoEm: new Date(),
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      areaM2: 175,
      aceitaPet: true,
      caracteristicas: ["Piscina", "Churrasqueira", "Varanda gourmet", "Ar condicionado", "Armários planejados"],
      valorAluguel: 320000,
      valorCondominio: 0,
      logradouro: "Rua das Palmeiras",
      numero: "120",
      bairro: "Jardim Alvorada",
      cidade: "Barretos",
      uf: "SP",
      cep: "14780000",
      descricao: "Excelente casa térrea com acabamento impecável, sala ampla integrada à cozinha americana, suíte master com closet, quintal com piscina privativa e área gourmet para receber a família e amigos.",
      offsetFotos: 0,
    },
    {
      codigo: "VIT-02",
      titulo: "Apartamento Mobiliado no Centro",
      tipo: "APARTAMENTO" as const,
      status: "DISPONIVEL" as const,
      publicadoNoSite: true,
      publicadoEm: new Date(),
      quartos: 2,
      banheiros: 1,
      vagas: 1,
      areaM2: 72,
      aceitaPet: true,
      caracteristicas: ["Mobiliado", "Sacada", "Elevador", "Portaria 24h", "Academia"],
      valorAluguel: 185000,
      valorCondominio: 32000,
      logradouro: "Avenida 21",
      numero: "450",
      bairro: "Centro",
      cidade: "Barretos",
      uf: "SP",
      cep: "14780000",
      descricao: "Apartamento pronto para morar, totalmente mobiliado e decorado, no coração de Barretos. Próximo a supermercados, farmácias e aos principais pontos comerciais da cidade.",
      offsetFotos: 4,
    },
    {
      codigo: "VIT-03",
      titulo: "Sala Comercial Moderna",
      tipo: "SALA_COMERCIAL" as const,
      status: "DISPONIVEL" as const,
      publicadoNoSite: true,
      publicadoEm: new Date(),
      quartos: 1,
      banheiros: 1,
      vagas: 1,
      areaM2: 48,
      aceitaPet: false,
      caracteristicas: ["Recepção", "Ar condicionado", "Piso porcelanato", "Interfone", "Acessibilidade"],
      valorAluguel: 140000,
      valorCondominio: 18000,
      logradouro: "Rua 28",
      numero: "980",
      bairro: "América",
      cidade: "Barretos",
      uf: "SP",
      cep: "14780000",
      descricao: "Sala comercial ampla com iluminação natural privilegiada, recepção privativa e acabamento de alto padrão. Localização estratégica com facilidade de estacionamento e acesso.",
      offsetFotos: 8,
    },
  ];

  for (const dados of imoveisData) {
    const { offsetFotos, ...campos } = dados;
    const existente = await db.imovel.findUnique({ where: { codigo: campos.codigo } });
    const imovel = existente
      ? await db.imovel.update({ where: { id: existente.id }, data: campos })
      : await db.imovel.create({ data: campos });

    console.log(`✓ Imóvel ${imovel.codigo} (${imovel.titulo}) sincronizado.`);

    if (fotosProcessadas.length > 0) {
      // Deleta fotos anteriores desse imóvel de demonstração antes de reinserir
      await db.arquivo.deleteMany({ where: { imovelId: imovel.id, categoria: "FOTO" } });

      for (let i = 0; i < 4; i++) {
        const foto = fotosProcessadas[(offsetFotos + i) % fotosProcessadas.length];
        const id = randomUUID();
        const caminho = `imovel/${imovel.id}/${id}.webp`;
        const caminhoThumb = `imovel/${imovel.id}/${id}-thumb.webp`;

        await storage.save(caminho, foto.data);
        await storage.save(caminhoThumb, foto.thumb);

        await db.arquivo.create({
          data: {
            categoria: "FOTO",
            nomeOriginal: foto.nome,
            caminho,
            caminhoThumb,
            mime: "image/webp",
            tamanho: foto.data.byteLength,
            largura: foto.width,
            altura: foto.height,
            ordem: i,
            capa: i === 0,
            imovelId: imovel.id,
          },
        });
      }
      console.log(`  └ 4 fotos anexadas a ${imovel.codigo}`);
    }
  }

  console.log("Concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
