/**
 * Modelos padrão do sistema (usados no seed e como fallback quando nenhum modelo
 * "padrão" foi cadastrado em Configurações para a finalidade do contrato).
 * Texto com marcações simples (# título, ## subtítulo, **negrito**) e variáveis
 * {{...}} substituídas por features/contratos/template.ts.
 */

export const MODELO_RESIDENCIAL_PADRAO = `# CONTRATO DE LOCAÇÃO DE IMÓVEIS PARA FINS RESIDENCIAIS

Pelo presente instrumento particular, de um lado {{locador.qualificacao}}, doravante denominada proprietária LOCADORA, e de outro lado, **{{locatario.nome}}**, {{locatario.nacionalidade}}, {{locatario.estadoCivil}}, {{locatario.profissao}}, portador(a) do RG nº {{locatario.rg}} e do CPF nº {{locatario.documento}}, residente e domiciliado(a) à {{locatario.endereco}}, doravante denominado LOCATÁRIO, têm entre si justo e acertado o presente CONTRATO DE LOCAÇÃO, mediante as cláusulas e condições seguintes, que mutuamente aceitam, a saber:

CLÁUSULA PRIMEIRA - O LOCADOR se obriga, neste ato, a dar em locação ao LOCATÁRIO o imóvel residencial de sua propriedade, **localizado à {{imovel.endereco}}.**

CLÁUSULA SEGUNDA - O prazo do presente contrato de locação é de {{contrato.prazoExtenso}}, a iniciar no dia {{contrato.dataInicio}}, para terminar no dia {{contrato.dataFim}}, data em que o LOCATÁRIO se obriga a restituir o imóvel locado no perfeito estado de conservação em que o recebeu, salvo as deteriorações decorrentes do uso normal, inteiramente livre e desocupado.

Parágrafo único – O mesmo poderá ser rescindido pelas partes após 12 (doze) meses do início do contrato de locação, desde que aquela que pretenda rescindir o contrato notifique a outra por escrito com antecedência mínima de 30 (trinta) dias, ficando assim, isenta do pagamento da multa contratual. Caso isto não ocorra, a multa pela rescisão do contrato deverá ser paga pela parte que rescindir o mesmo respeitando o prazo total do contrato.

CLÁUSULA TERCEIRA - A presente locação destina-se a fins exclusivamente residenciais, estando proibida qualquer alteração desta destinação, salvo mediante concordância expressa por escrito pelo LOCADOR.

CLÁUSULA QUARTA – O aluguel mensal é de **{{contrato.valorAluguel}} ({{contrato.valorAluguelExtenso}})**. {{contrato.encargosBloco}} Contando a partir da data do início do contrato, em caso de atraso, sem prejuízo da ação de despejo cabível, o mesmo será acrescido de juros de {{contrato.percJuros}} ao mês, além da atualização do débito a ser apurado, de acordo com o índice legal.

CLÁUSULA QUINTA: O aluguel mensal vence sempre no dia {{contrato.diaVencimento}} ({{contrato.diaVencimentoExtenso}}) de cada mês, ficando pactuado que o mesmo deverá ser pago pontualmente até o dia {{contrato.diaVencimento}} ({{contrato.diaVencimentoExtenso}}) de cada mês, ao seu vencimento, diretamente com o proprietário.

§ 1°. Passado este prazo, haverá um acréscimo no percentual de {{contrato.percMulta}} correspondente à multa, mais {{contrato.percJuros}} de juros ao mês, ficando sujeito às penas impostas contratualmente nas cláusulas deste contrato.

§ 2°. Após o vencimento, o LOCADOR poderá enviar o recibo de aluguéis e de encargos locatários para cobrança por meio de seu advogado, respondendo o LOCATÁRIO pelos honorários advocatícios mesmo que a cobrança seja extrajudicial; se for judicial, deverá pagar às custas delas decorrentes.

§ 3°. O aluguel será reajustado anualmente com base na aplicação do índice {{contrato.indiceReajuste}}.

CLÁUSULA SEXTA - Além dos valores referentes aos aluguéis o LOCATÁRIO também será responsável, enquanto durar a locação, por: a) contribuições de melhorias; b) todas as despesas de conservação do prédio, de seguro, de consumo de água, luz, telefone, coleta de lixo, taxas condominiais e outras ligadas ao uso do imóvel; e c) todas as multas pecuniárias provenientes do atraso no pagamento de quantias sob a sua responsabilidade, sob pena de rescisão contratual, em caso de descumprimento.

Parágrafo único. O LOCATÁRIO, no curso da locação, obriga-se, ainda, a satisfazer todas as exigências do Poder Público a que der causa que não constituirão motivo para rescisão deste contrato, salvo se o prédio for considerado inabitável, fato este que deverá ser averiguado em vistoria judicial.

CLÁUSULA SÉTIMA - O LOCATÁRIO, exceto as obras que importem na segurança do imóvel, obriga-se por todas as outras, devendo trazê-lo em perfeito estado de conservação, e em boas condições de higiene, para assim restituí-lo com todas as instalações sanitárias e elétricas, fechos, vidros, torneiras, ralos, armários embutidos dos quartos e cozinha, cooktop e demais acessórios, quando findo ou rescindido este contrato, sem direito a retenção ou indenização por benfeitorias ainda que necessárias, as quais ficarão a ele incorporadas.

Parágrafo único. A introdução de qualquer modificação no imóvel locado dependerá de prévio e escrito consenso do LOCADOR, que, contudo, não terá o dever de concedê-lo.

CLÁUSULA OITAVA - Não será permitida a transferência deste contrato, nem a sublocação, cessão ou empréstimo total ou parcial do imóvel locado, sem prévia autorização por escrito do LOCADOR.

CLÁUSULA NONA - Se o LOCADOR manifestar a intenção de vender o imóvel locado e o LOCATÁRIO não exercer o seu direito de preferência de adquiri-lo em igualdade de condições com terceiros, o LOCATÁRIO estará obrigado a permitir que as pessoas interessadas na compra do imóvel o visitem.

CLÁUSULA DÉCIMA - O LOCATÁRIO faculta ao LOCADOR o exame e vistoria do imóvel locado, quando este julgar necessário, em dia e hora previamente acordados, a fim de verificar o seu estado de conservação, no caso de má conservação do imóvel pelo locatário(a) este contrato será rescindido e com a multa contratual e danos causados a ser paga pelo mesmo.

CLÁUSULA DÉCIMA PRIMEIRA - Se houver desapropriação do imóvel locado, este contrato ficará rescindido de pleno direito, sem qualquer indenização, ressalvando-se, porém, o direito do LOCATÁRIO de reclamar ao poder expropriante a indenização pelos prejuízos, porventura, sofridos.

CLÁUSULA DÉCIMA SEGUNDA - Se houver incêndio ou acidente, que conduza à reconstrução ou reforma do objeto da locação, rescindir-se-á o contrato, sem prejuízo da responsabilidade do LOCATÁRIO, se o fato não ocorreu por sua culpa.

CLÁUSULA DÉCIMA TERCEIRA - Todo e qualquer ajuste entre as partes, para integrar o presente contrato, deverá ser feito por escrito.

CLÁUSULA DÉCIMA QUARTA - Fica estipulada a multa contratual correspondente a {{contrato.multaRescisoriaExtenso}} do valor do Aluguel vigente, a ser paga pela parte que infringir qualquer cláusula do mesmo, inclusive atraso no pagamento de aluguel, no caso de ações de despejo ou pela desocupação do imóvel antes de findo o prazo deste contrato.

§ 1°. As despesas para sanar os estragos causados ao imóvel e suas instalações, ou para executar eventuais modificações feitas no imóvel pelo LOCATÁRIO, serão por ele pagas à parte, não se incluindo a multa acima estipulada.

§ 2°. A eventual tolerância do LOCADOR para com qualquer infração contratual, atraso no pagamento dos aluguéis, taxas ou impostos, não constituirá motivo para que o LOCATÁRIO ou seu fiador alegue novação.

CLÁUSULA DÉCIMA QUINTA - Este contrato extinguir-se-á com o falecimento de qualquer das partes, ressalvado o direito dos sucessores de, no prazo de 30 dias do falecimento, dar seguimento ao contrato. Em caso de silêncio o contrato será automaticamente convalidado pelos sucessores.

{{contrato.garantiaClausula}}

CLÁUSULA {{contrato.numeroForo}} - As partes elegem o foro da Comarca de {{locador.cidade}}, que é o da situação do imóvel para dirimir as questões resultantes da execução do presente contrato, obrigando-se a parte vencida a pagar à vencedora, além das custas e despesas processuais, honorários advocatícios fixados em 20% (vinte por cento) sobre o valor da causa. E, assim, por estarem justas e convencionadas, as partes assinam o presente instrumento particular de CONTRATO DE LOCAÇÃO em 02 (duas) vias de igual teor, juntamente com duas testemunhas abaixo, a tudo presentes.

{{locador.cidade}}, ____ de ______________ de ________.

__________________________________
{{locador.razaoSocial}}
LOCADORA

__________________________________
{{locatario.nome}}
LOCATÁRIO
{{fiadores.assinaturas}}

__________________________________
Testemunha 1: ______________________

__________________________________
Testemunha 2: ______________________
`;

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
