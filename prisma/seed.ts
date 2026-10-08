/**
 * Popula o banco com o essencial para usar o sistema:
 * usuário administrador, categorias de despesa, configurações e um modelo de contrato.
 *
 * Com SEED_DEMO=true (padrão em desenvolvimento) também cria um empreendimento,
 * um imóvel com as fotos de ImovelExemplo/, um inquilino e um contrato ativo.
 */
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { calcularDataFim, gerarCobrancas } from "../src/features/contratos/services/cobrancas";
import { DEFAULT_SETTINGS } from "../src/features/configuracoes/schemas";
import { db } from "../src/lib/db";
import { today, utcDate } from "../src/lib/dates";
import { processImage } from "../src/lib/images";
import { storage } from "../src/lib/storage";

const CATEGORIAS = [
  "Manutenção",
  "Reforma",
  "IPTU",
  "Condomínio",
  "Água",
  "Energia",
  "Seguro",
  "Taxas e cartório",
  "Material",
  "Outros",
];

const MODELO_RESIDENCIAL = `# CONTRATO DE LOCAÇÃO RESIDENCIAL

**LOCADOR:** {{locador.nome}}, inscrito(a) no CPF/CNPJ sob nº {{locador.documento}}, com endereço em {{locador.endereco}}.

**LOCATÁRIO:** {{locatario.nome}}, {{locatario.nacionalidade}}, {{locatario.estadoCivil}}, {{locatario.profissao}}, portador(a) do RG nº {{locatario.rg}} e do CPF/CNPJ nº {{locatario.documento}}, residente e domiciliado(a) em {{locatario.endereco}}.

{{fiadores.bloco}}

As partes acima identificadas celebram o presente contrato de locação para fins residenciais, regido pela Lei nº 8.245/91, mediante as cláusulas a seguir.

## CLÁUSULA 1ª – DO OBJETO

O LOCADOR dá em locação ao LOCATÁRIO o imóvel situado em {{imovel.endereco}}, aqui identificado como {{imovel.titulo}}, destinado exclusivamente ao uso residencial do LOCATÁRIO e de sua família.

## CLÁUSULA 2ª – DO PRAZO

A locação vigora por {{contrato.prazoExtenso}}, com início em {{contrato.dataInicio}} e término em {{contrato.dataFim}}, independentemente de aviso ou notificação, obrigando-se o LOCATÁRIO a devolver o imóvel nas condições em que o recebeu.

## CLÁUSULA 3ª – DO ALUGUEL

O aluguel mensal é de {{contrato.valorAluguel}} ({{contrato.valorAluguelExtenso}}), a ser pago até o dia {{contrato.diaVencimento}} de cada mês, {{contrato.formaPagamentoTexto}}.

{{contrato.encargosBloco}}

## CLÁUSULA 4ª – DO ATRASO

O atraso no pagamento sujeita o LOCATÁRIO à multa de {{contrato.percMulta}} sobre o valor devido e a juros de mora de {{contrato.percJuros}} ao mês, calculados proporcionalmente aos dias de atraso, além da correção monetária.

## CLÁUSULA 5ª – DO REAJUSTE

O valor do aluguel será reajustado a cada 12 (doze) meses pela variação acumulada do {{contrato.indiceReajuste}} ou, na sua falta, por outro índice que venha a substituí-lo.

## CLÁUSULA 6ª – DOS ENCARGOS

Correm por conta do LOCATÁRIO as despesas de consumo de água, energia elétrica, gás, taxas de condomínio ordinárias e demais encargos decorrentes do uso do imóvel, cabendo ao LOCADOR as despesas extraordinárias de condomínio e o imposto predial, salvo disposição expressa em contrário neste contrato.

## CLÁUSULA 7ª – DA GARANTIA

{{contrato.garantiaTexto}}

## CLÁUSULA 8ª – DA CONSERVAÇÃO E DAS BENFEITORIAS

O LOCATÁRIO recebe o imóvel em perfeito estado de conservação, conforme termo de vistoria, e se obriga a mantê-lo assim, devolvendo-o no mesmo estado ao fim da locação. Benfeitorias necessárias serão indenizáveis quando previamente autorizadas por escrito; as úteis e voluptuárias não geram direito a indenização nem a retenção.

## CLÁUSULA 9ª – DA RESCISÃO

A devolução do imóvel antes do prazo final sujeita o LOCATÁRIO ao pagamento de multa equivalente a {{contrato.multaRescisoriaMeses}} aluguel(éis), reduzida proporcionalmente ao período já cumprido, nos termos do art. 4º da Lei nº 8.245/91. O descumprimento de qualquer cláusula permite à parte prejudicada rescindir o contrato e exigir as penalidades cabíveis.

## CLÁUSULA 10ª – DO FORO

Fica eleito o foro da comarca de {{locador.cidade}} para dirimir questões oriundas deste contrato.

E por estarem de acordo, as partes assinam o presente instrumento em duas vias de igual teor.

{{locador.cidade}}, {{data.hoje}}.

___________________________________________
{{locador.nome}} — LOCADOR

___________________________________________
{{locatario.nome}} — LOCATÁRIO

{{fiadores.assinaturas}}`;

async function criarUsuario(nome: string, email: string, senha: string, role: "admin" | "operador") {
  const existente = await db.user.findUnique({ where: { email } });
  if (existente) return existente;

  const user = await db.user.create({
    data: { id: randomUUID(), name: nome, email, emailVerified: true, role },
  });
  await db.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: await hashPassword(senha),
    },
  });
  return user;
}

async function seedBasico() {
  const admin = await criarUsuario(
    process.env.ADMIN_NAME || "Administrador",
    process.env.ADMIN_EMAIL || "admin@pinas.com.br",
    process.env.ADMIN_PASSWORD || "pina@2026",
    "admin",
  );
  console.log(`✓ Administrador: ${admin.email}`);

  for (const nome of CATEGORIAS) {
    await db.categoriaDespesa.upsert({ where: { nome }, create: { nome }, update: {} });
  }
  console.log(`✓ ${CATEGORIAS.length} categorias de despesa`);

  for (const [chave, valor] of Object.entries(DEFAULT_SETTINGS)) {
    await db.configuracao.upsert({
      where: { chave },
      create: { chave, valor },
      update: {},
    });
  }
  console.log("✓ Configurações padrão");

  const modelo = await db.modeloContrato.findFirst({ where: { padrao: true } });
  if (!modelo) {
    await db.modeloContrato.create({
      data: {
        nome: "Locação residencial (modelo base)",
        finalidade: "RESIDENCIAL",
        conteudo: MODELO_RESIDENCIAL,
        padrao: true,
      },
    });
    console.log("✓ Modelo de contrato padrão");
  }

  return admin;
}

async function seedFotos(imovelId: string) {
  const pasta = path.resolve(process.cwd(), "ImovelExemplo");
  let arquivos: string[] = [];
  try {
    arquivos = (await readdir(pasta)).filter((nome) => /\.(jpe?g|png|webp)$/i.test(nome)).sort();
  } catch {
    console.log("· Pasta ImovelExemplo não encontrada — imóvel criado sem fotos.");
    return;
  }

  let ordem = 0;
  for (const nome of arquivos) {
    const original = await readFile(path.join(pasta, nome));
    const { data, width, height, thumb } = await processImage(original);
    const id = randomUUID();
    const caminho = `imovel/${imovelId}/${id}.webp`;
    const caminhoThumb = `imovel/${imovelId}/${id}-thumb.webp`;
    await storage.save(caminho, data);
    await storage.save(caminhoThumb, thumb);
    await db.arquivo.create({
      data: {
        categoria: "FOTO",
        nomeOriginal: nome,
        caminho,
        caminhoThumb,
        mime: "image/webp",
        tamanho: data.byteLength,
        largura: width,
        altura: height,
        ordem,
        capa: ordem === 0,
        imovelId,
      },
    });
    ordem++;
  }
  console.log(`✓ ${ordem} fotos do imóvel de exemplo`);
}

async function seedDemo(adminId: string) {
  if (await db.imovel.findFirst()) {
    console.log("· Já existem imóveis — dados de exemplo não foram recriados.");
    return;
  }

  const empreendimento = await db.empreendimento.create({
    data: {
      nome: "Edifício ADM",
      logradouro: "Rua Vinte e Oito",
      numero: "1234",
      bairro: "Centro",
      cidade: "Barretos",
      uf: "SP",
      cep: "14780000",
      observacoes: "Prédio com 8 unidades: 4 apartamentos e 4 kitnets.",
    },
  });

  const imovel = await db.imovel.create({
    data: {
      codigo: "ADM-02",
      titulo: "Apto 02 – Ed. ADM",
      tipo: "APARTAMENTO",
      status: "ALUGADO",
      empreendimentoId: empreendimento.id,
      logradouro: "Rua Vinte e Oito",
      numero: "1234",
      complemento: "Apto 02",
      bairro: "Centro",
      cidade: "Barretos",
      uf: "SP",
      cep: "14780000",
      quartos: 2,
      suites: 1,
      banheiros: 2,
      vagas: 1,
      areaM2: 68,
      mobilia: "SEMI",
      aceitaPet: true,
      caracteristicas: ["Fechadura digital", "Armários planejados", "Churrasqueira"],
      valorAluguel: 150_000,
      valorCondominio: 28_000,
      valorIptuAnual: 96_000,
      descricao: "Apartamento reformado, com cozinha planejada e área de serviço.",
    },
  });

  await seedFotos(imovel.id);

  const inquilino = await db.pessoa.create({
    data: {
      tipo: "PF",
      papeis: ["INQUILINO"],
      nome: "João da Silva",
      documento: "52998224725",
      rg: "34.567.890-1",
      estadoCivil: "CASADO",
      profissao: "Técnico agrícola",
      rendaMensal: 620_000,
      email: "joao.silva@exemplo.com.br",
      telefone1: "17991234567",
      logradouro: "Rua Vinte e Oito",
      numero: "1234",
      complemento: "Apto 02",
      bairro: "Centro",
      cidade: "Barretos",
      uf: "SP",
      cep: "14780000",
    },
  });

  const fiador = await db.pessoa.create({
    data: {
      tipo: "PF",
      papeis: ["FIADOR"],
      nome: "Maria Aparecida Souza",
      documento: "11144477735",
      estadoCivil: "VIUVO",
      profissao: "Comerciante",
      telefone1: "17998887766",
      cidade: "Barretos",
      uf: "SP",
    },
  });

  const hoje = today();
  const dataInicio = utcDate(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1, 1);
  const prazoMeses = 30;
  const valorAluguel = 150_000;
  const encargos = [{ descricao: "Condomínio", valor: 28_000 }];
  const previstas = gerarCobrancas({
    dataInicio,
    prazoMeses,
    diaVencimento: 10,
    valorAluguel,
    valorEncargos: 28_000,
    aluguelAntecipado: false,
  });

  const contrato = await db.contrato.create({
    data: {
      status: "ATIVO",
      finalidade: "RESIDENCIAL",
      imovelId: imovel.id,
      dataInicio,
      prazoMeses,
      dataFim: calcularDataFim(dataInicio, prazoMeses),
      valorAluguel,
      valorInicial: valorAluguel,
      diaVencimento: 10,
      indiceReajuste: "IGPM",
      garantia: "FIADOR",
      criadoPorId: adminId,
      partes: {
        create: [
          { pessoaId: inquilino.id, papel: "LOCATARIO", principal: true },
          { pessoaId: fiador.id, papel: "FIADOR" },
        ],
      },
      encargos: { create: encargos },
      cobrancas: { create: previstas },
    },
  });

  // Primeira cobrança já recebida, para o painel não nascer vazio.
  const primeira = await db.cobranca.findFirst({
    where: { contratoId: contrato.id },
    orderBy: { competencia: "asc" },
  });
  if (primeira) {
    await db.pagamento.create({
      data: {
        cobrancaId: primeira.id,
        dataPagamento: primeira.vencimento,
        valorPrincipal: primeira.valorTotal,
        valorPago: primeira.valorTotal,
        forma: "PIX",
        registradoPorId: adminId,
      },
    });
    await db.cobranca.update({ where: { id: primeira.id }, data: { status: "PAGO" } });
  }

  const categoria = await db.categoriaDespesa.findUnique({ where: { nome: "Manutenção" } });
  if (categoria) {
    await db.despesa.create({
      data: {
        imovelId: imovel.id,
        categoriaId: categoria.id,
        data: hoje,
        valor: 32_000,
        fornecedor: "Elétrica Barretos",
        descricao: "Troca do disjuntor do quadro de força",
        criadoPorId: adminId,
      },
    });
  }

  console.log("✓ Dados de exemplo (empreendimento, imóvel, contrato e cobranças)");
}

async function main() {
  const admin = await seedBasico();
  if (process.env.SEED_DEMO !== "false") await seedDemo(admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
