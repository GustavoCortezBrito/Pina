/**
 * Modelos padrão do sistema (usados no seed e como fallback quando nenhum modelo
 * "padrão" foi cadastrado em Configurações para a finalidade do contrato).
 * Texto com marcações simples (# título, ## subtítulo, **negrito**) e variáveis
 * {{...}} substituídas por features/contratos/template.ts.
 */

export const MODELO_RESIDENCIAL_PADRAO = `# CONTRATO DE LOCAÇÃO RESIDENCIAL

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

export const MODELO_COMERCIAL_PADRAO = `# CONTRATO DE LOCAÇÃO NÃO RESIDENCIAL

**LOCADOR:** {{locador.nome}}, inscrito(a) no CPF/CNPJ sob nº {{locador.documento}}, com endereço em {{locador.endereco}}.

**LOCATÁRIO:** {{locatario.nome}}, {{locatario.nacionalidade}}, {{locatario.estadoCivil}}, {{locatario.profissao}}, portador(a) do RG nº {{locatario.rg}} e do CPF/CNPJ nº {{locatario.documento}}, residente e domiciliado(a) em {{locatario.endereco}}.

{{fiadores.bloco}}

As partes acima identificadas celebram o presente contrato de locação para fins não residenciais (comerciais), regido pela Lei nº 8.245/91, mediante as cláusulas a seguir.

## CLÁUSULA 1ª – DO OBJETO

O LOCADOR dá em locação ao LOCATÁRIO o imóvel situado em {{imovel.endereco}}, aqui identificado como {{imovel.titulo}}, destinado exclusivamente ao exercício de atividade comercial lícita do LOCATÁRIO, vedada a mudança de destinação sem anuência prévia e por escrito do LOCADOR.

## CLÁUSULA 2ª – DO PRAZO

A locação vigora por {{contrato.prazoExtenso}}, com início em {{contrato.dataInicio}} e término em {{contrato.dataFim}}, independentemente de aviso ou notificação, obrigando-se o LOCATÁRIO a devolver o imóvel nas condições em que o recebeu.

## CLÁUSULA 3ª – DO ALUGUEL

O aluguel mensal é de {{contrato.valorAluguel}} ({{contrato.valorAluguelExtenso}}), a ser pago até o dia {{contrato.diaVencimento}} de cada mês, {{contrato.formaPagamentoTexto}}.

{{contrato.encargosBloco}}

## CLÁUSULA 4ª – DO ATRASO

O atraso no pagamento sujeita o LOCATÁRIO à multa de {{contrato.percMulta}} sobre o valor devido e a juros de mora de {{contrato.percJuros}} ao mês, calculados proporcionalmente aos dias de atraso, além da correção monetária.

## CLÁUSULA 5ª – DO REAJUSTE

O valor do aluguel será reajustado a cada 12 (doze) meses pela variação acumulada do {{contrato.indiceReajuste}} ou, na sua falta, por outro índice que venha a substituí-lo.

## CLÁUSULA 6ª – DOS ENCARGOS, LICENÇAS E TRIBUTOS

Correm por conta do LOCATÁRIO as despesas de consumo de água, energia elétrica, gás, taxas de condomínio ordinárias, alvará de funcionamento e demais licenças exigidas para o exercício de sua atividade, cabendo ao LOCADOR as despesas extraordinárias de condomínio e o imposto predial, salvo disposição expressa em contrário neste contrato.

## CLÁUSULA 7ª – DA GARANTIA

{{contrato.garantiaTexto}}

## CLÁUSULA 8ª – DA CONSERVAÇÃO, BENFEITORIAS E USO DO IMÓVEL

O LOCATÁRIO recebe o imóvel em perfeito estado de conservação, conforme termo de vistoria, e se obriga a mantê-lo assim, devolvendo-o no mesmo estado ao fim da locação, ressalvado o desgaste natural de uso. Benfeitorias necessárias serão indenizáveis quando previamente autorizadas por escrito; as úteis e voluptuárias não geram direito a indenização nem a retenção, podendo ser retiradas ao final, desde que não comprometam a estrutura do imóvel.

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
