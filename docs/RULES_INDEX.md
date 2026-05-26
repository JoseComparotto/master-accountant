# Especificação e Invariantes do Domínio: Plano de Contas

Este documento estabelece as diretrizes normativas e as invariantes de negócio para o módulo de Plano de Contas. As regras aqui descritas operam no nível do domínio (Domain-Driven Design), sendo agnósticas à infraestrutura, banco de dados ou frameworks.

## 1. Linguagem Ubíqua (Glossário de Domínio)

As definições abaixo formam o vocabulário oficial do sistema e devem ser estritamente respeitadas em documentações, debates arquiteturais e nomenclaturas de código.

* **Classe Contábil:** A macrocategoria financeira à qual uma conta pertence, ditando sua natureza primária (ex: Ativo, Passivo, Patrimônio Líquido, Receita, Despesa).
* **Conta Analítica:** Entidade contábil em nível terminal (folha da árvore). É a única conta apta a receber lançamentos contábeis diretos (partidas dobradas).
* **Conta Sintética:** Entidade contábil de nível intermediário ou raiz (nó da árvore). Atua exclusivamente como agrupadora estrutural para totalização de saldos de seus descendentes. Não recebe lançamentos diretos.
* **Conta Redutora (Contra-Account):** Entidade contábil que, por definição de sua natureza, subtrai valor do grupo em que está inserida, possuindo comportamento matemático inverso ao padrão de sua Classe Contábil.
* **Pacote de Alterações (Changeset):** A unidade transacional bitemporal que agrupa propostas de modificação no Plano de Contas. Garante que o plano transite de um estado consistente para o próximo de forma atômica, semântica e auditável.
* **Transição Estrutural:** O rastro imutável de ciclo de vida que justifica a mutação de uma conta dentro da árvore (ex: criação, descontinuação, decomposição, unificação, reclassificação).

---

## 2. Escopos e Identificadores de Regra (Namespaces)

Para garantir a rastreabilidade em testes, validações e logs de erro, toda invariante de domínio é identificada por um prefixo de contexto seguido de um sequencial numérico.

| Contexto | Descrição |
| :--- | :--- |
| **COA** | Invariantes de delimitação, escopo e unicidade do Plano de Contas. |
| **HTR** | Invariantes de hierarquia, topologia e integridade da árvore (Hierarchy & Tree). |
| **CHG** | Invariantes de versionamento, imutabilidade e ciclo de vida de Pacotes de Alterações. |
| **TRN** | Invariantes de fluxo temporal e rastreabilidade estrutural (Transitions). |
| **NAT** | Invariantes matemáticas de natureza, classes e saldos lógicos. |

---

## 3. Invariantes de Escopo do Plano (COA)

Governa as barreiras isoladas de cada estrutura contábil.

* **COA-01 - Isolamento de Contexto (Bounded Context):** Todos os artefatos manipulados dentro de um Pacote de Alterações (novas contas, metadados, transições e inativações) devem pertencer estritamente ao mesmo Plano de Contas. O cruzamento transacional entre planos distintos é terminantemente proibido.

## 4. Invariantes Estruturais da Árvore (HTR)

Define as leis físicas que organizam o arranjo espacial e as relações de parentesco das contas.

* **HTR-01 - Unicidade de Raiz Absoluta:** É permitida a existência de apenas uma Conta Sintética atuando como raiz (sem ascendentes) para cada Classe Contábil dentro de um mesmo Plano de Contas.
* **HTR-02 - Exclusividade de Paternidade Sintética:** A capacidade de atuar como conta ascendente é privilégio exclusivo das Contas Sintéticas. Uma Conta Analítica é estritamente estrutural e não pode, sob nenhuma hipótese, possuir contas descendentes.
* **HTR-03 - Continuidade de Linhagem:** A conta ascendente atribuída a uma nova conta no momento de sua concepção deve consistir em uma entidade ativa previamente publicada, ou ser simultaneamente introduzida no mesmo Pacote de Alterações.

## 5. Invariantes de Versionamento e Ciclo de Vida (CHG)

Garante o rigor histórico e a aplicação progressiva do plano.

* **CHG-01 - Consistência de Incremento Semântico:** Pacotes de Alterações classificados com incremento estrutural (MAJOR) são obrigatórios quando houver criação, movimentação ou encerramento de contas. Incrementos pontuais (MINOR) são estritamente reservados para correção de metadados, sendo proibida a presença de Transições Estruturais em seu escopo.
* **CHG-02 - Acoplamento de Estado Inicial:** A inserção de uma nova conta na topologia do plano exige a presença obrigatória e simultânea de seu estado declarativo (nome e metadados) encapsulado no mesmo Pacote de Alterações.

## 6. Invariantes de Mutações e Rastreabilidade (TRN)

Controla o surgimento, deslocamento e encerramento de nós ao longo do tempo.

* **TRN-01 - Unicidade Temporal de Papel:** É estruturalmente incoerente e, portanto, proibido que uma mesma conta figure de forma simultânea como origem e como destino de Transições Estruturais dentro do mesmo Pacote de Alterações.
* **TRN-02 - Justificativa de Encerramento Obrigatória:** O ato de inativar uma conta vigente exige a declaração mandatória de uma Transição Estrutural que documente a saída deste elemento da árvore operante.

## 7. Invariantes de Natureza e Lógica Matemática (NAT)

Assegura a base matemática necessária para que o motor transacional (Ledger) consolide saldos sem ambiguidades.

* **NAT-01 - Derivação Determinística de Saldo:** A natureza operacional de uma conta (Devedora ou Credora) não é um dado discricionário, mas sim uma consequência matemática derivada invariavelmente da disjunção exclusiva (XOR) entre sua Classe Contábil e seu status de Conta Redutora.
* **NAT-02 - Herança Compulsória de Redução:** Quando uma Conta Sintética for declarada como Conta Redutora, todas as suas contas descendentes diretas e indiretas devem, obrigatoriamente e sem exceção, compartilhar a mesma característica de Conta Redutora.