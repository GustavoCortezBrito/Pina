# 1. Visão geral

## Contexto

Rafael e o pai trabalham com venda de laranja e, em paralelo, sempre alugaram imóveis próprios (casas, apartamentos e kitnets) em Barretos-SP e região. Esse negócio cresceu, e hoje os dados ficam espalhados entre planilhas, WhatsApp, papel e memória. Isso dificulta saber:

- quais imóveis estão livres ou ocupados;
- quem pagou e quem está atrasado;
- quando cada contrato vence ou precisa de reajuste;
- onde estão as fotos, os documentos e as vistorias de cada imóvel.

## Objetivo

Criar um **sistema web interno** que centralize a gestão das locações e responda rapidamente a:

1. **Ocupação:** quais unidades estão alugadas, vagas ou em reforma?
2. **Financeiro:** quanto entra no mês, quanto está atrasado e quanto foi gasto em cada imóvel?
3. **Contratos:** quais vencem ou precisam de reajuste nos próximos 60 dias?
4. **Histórico:** o que aconteceu com cada imóvel e com cada inquilino (pagamentos, manutenções, vistorias)?

## Usuários

| Perfil | Quem | O que faz |
|--------|------|-----------|
| **Administrador** | Rafael, pai do Rafael | Acesso total, incluindo usuários, configurações e exclusões |
| **Operador** | Eventual funcionário ou secretária | Cadastra, lança pagamentos e anexa arquivos, mas não exclui nem vê configurações |

O sistema é **interno**: não há portal público nem acesso de inquilinos no MVP. O volume esperado é de dezenas a poucas centenas de unidades e de 2 a 5 usuários.

## Escopo do MVP

- Login com usuário e senha
- Cadastro de **imóveis** (com agrupamento por prédio ou condomínio), com **galeria de fotos** e **documentos**
- Cadastro de **pessoas** (inquilinos, fiadores e proprietários), PF ou PJ
- **Contratos** de locação com geração automática das cobranças mensais
- **Cobranças e pagamentos**: baixa manual, cálculo de multa e juros por atraso, e recibo em PDF
- **Despesas** por imóvel (manutenção, IPTU, condomínio etc.)
- **Dashboard** com ocupação, receita, inadimplência e alertas de vencimento e reajuste
- Geração do **contrato em PDF** a partir de um modelo

## Fora do escopo do MVP (fases futuras)

- Emissão automática de boleto ou Pix com conciliação bancária
- Envio automático de lembretes por WhatsApp ou e-mail
- Portal do inquilino
- Vistoria por app com checklist e fotos no celular (no MVP, a vistoria é um registro com anexos)
- Assinatura digital de contratos
- Página pública de "imóveis disponíveis"
- Emissão de nota fiscal e integração contábil

## Dúvidas para validar com o Rafael

> Levar estas perguntas para a primeira reunião. As respostas podem mudar o modelo de dados.

1. Quantos imóveis ou unidades existem hoje, e quantos prédios com várias unidades (ex.: porta "02 ADM")?
2. Todos os imóveis são deles ou também administram imóveis de terceiros (com repasse ao proprietário)?
3. Como cobram hoje: Pix, boleto, dinheiro, transferência? Qual o dia de vencimento padrão?
4. Qual índice de reajuste usam (IGP-M, IPCA, outro)? O reajuste é anual?
5. Que garantias aceitam: fiador, caução, seguro-fiança, título de capitalização?
6. Qual é a multa por atraso e os juros usados hoje? E a multa por rescisão antecipada?
7. Água, luz, IPTU e condomínio ficam no nome do inquilino ou são cobrados junto com o aluguel?
8. Existe um modelo de contrato atual (Word ou PDF) para usarmos como base?
9. Alugam por temporada ou por períodos curtos (ex.: kitnet mensal sem contrato de 30 meses)?
10. Quem vai usar o sistema no dia a dia? Precisa funcionar bem no celular?
11. Já têm domínio ou VPS contratados?
12. Existe histórico em planilha que precise ser importado?
