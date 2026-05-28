import { Injectable } from "@nestjs/common";
import { AccountChangeset } from "@modules/chart-of-accounts/domain/entities/account-changeset.entity";
import { AccountNode } from "@modules/chart-of-accounts/domain/entities/account-node.entity";
import { TransitionMetadata } from "@modules/chart-of-accounts/domain/enums/transition-type.enum";
import { VersionIncrementType } from "@modules/chart-of-accounts/domain/enums/version-increment-type.enum";
import { DomainError } from "@shared/exceptions/domain.error";

/**
 * Serviço responsável por validar as regras de negócio associadas a um AccountChangeset antes de sua publicação.
 * # Regras de Negócios:
 * ## 1. Integridade de Escopo e Estado
 * * **R01 (Unicidade de Plano):** Todos os elementos envolvidos devem pertencer ao mesmo `ChartOfAccounts`.
 * * **R02 (Unicidade de Papel):** Um mesmo Nó não pode ser Origem e Destino de transições no mesmo pacote.
 * * **R03 (Snapshot Obrigatório):** Todo nó introduzido pelo pacote (`New Node`) deve possuir um `AccountSnapshot`.
 * * **R04 (Restrição de Snapshot em Nó Inativo):** É proibido criar/atualizar snapshots para nós inativos ou planejados para inativação.
 *
 * ## 2. Ciclo de Vida e Rastreabilidade (Transitions)
 * * **R05 (Origem Obrigatória - Novos Nós):** Novos nós devem possuir transição correspondente de cardinalidade de destino 1 (ex: 0:1, 1:1 ou N:1).
 * * **R06 (Destino Obrigatório - Nós Inativados):** Nós inativados devem possuir transição correspondente de cardinalidade de origem 1 (ex: 1:0, 1:1 ou 1:N).
 * * **R07 (Consistência de Transição):**
 *  * Exceto inativação (`1:0`), o nó alvo deve ser novo ou já vigente ativo.
 *  * Exceto criação (`0:1`), o nó de origem deve estar na lista de inativados.
 * 
 * ## 3. Cardinalidade e Colisão de Fluxo
 * * **R08 (Exclusividade de Origem `1:*`):** Proíbe colisão de saída para o mesmo nó de origem.
 * * **R09 (Exclusividade de Destino `*:1`):** Proíbe colisão de entrada para o mesmo nó de destino.
 * 
 * ## 4. Regras Hierárquicas e Estruturais
 * * **R10 (Integridade de Descendência Ativa):** Nó não pode ser inativado se possuir descendentes ativos não planejados para inativação.
 * * **R11 (Bloqueio de Pai Analítico):** Apenas nós Sintéticos podem possuir descendentes.
 * * **R12 (Bloqueio de Ascendência Morta):** Proíbe criar nós descendendo de um nó inativo ou planejado para inativação.
 * * **R13 (Validação de Gaps de Linhagem):** O nó pai deve ser vigente ou um novo nó do mesmo pacote.
 * 
 * ## 5. Versionamento e Semântica (SemVer)
 * * **R14 (Consistência de Incremento):** MINOR proíbe transições estruturais; MAJOR é obrigatório se houver transições.
 */
@Injectable()
export class AccountChangesetValidator {
    validate(changeset: AccountChangeset) {
        this.validateIsNonEmpty(changeset);
        this.validateVersionAndScope(changeset);
        this.validateTransitions(changeset);
        this.validateHierarchy(changeset);
    }

    private validateIsNonEmpty(cs: AccountChangeset) {
        if (cs.newSnapshots.count() === 0 && cs.transitions.count() === 0 && cs.newNodes.count() === 0) {
            throw new DomainError('Não é possível publicar um pacote sem alterações.');
        }
    }

    private validateVersionAndScope(cs: AccountChangeset) {
        const coaId = cs.chartOfAccounts.id;
        const transitions = cs.transitions.getItems();

        // R01: Helper para garantir unicidade de plano
        const assertCoA = (obj: { id: string; chartOfAccounts: { id: string } }, role: string) => {
            if (obj.chartOfAccounts.id !== coaId) {
                throw new DomainError(`${role} ${obj.id} pertence a um ChartOfAccounts diferente (R01)`);
            }
        };

        const allSources = new Set<string>();
        const allTargets = new Set<string>();

        for (const t of transitions) {
            if (t.sourceNode) {
                assertCoA(t.sourceNode, 'Source Node');
                allSources.add(t.sourceNode.id);
            }
            if (t.targetNode) {
                assertCoA(t.targetNode, 'Target Node');
                allTargets.add(t.targetNode.id);
            }

            // R02: Verificação de intersecção global no Changeset
            if (t.sourceNode && t.targetNode && t.sourceNode.id === t.targetNode.id) {
                throw new DomainError(`Nó ${t.sourceNode.id} figura como origem e destino (R02).`);
            }
        }

        // R02: Validação estendida entre transições distintas
        for (const nodeId of allSources) {
            if (allTargets.has(nodeId)) {
                throw new DomainError(`Nó ${nodeId} figura como origem e destino em transições distintas (R02).`);
            }
        }

        // R03: Snapshot Obrigatório para Novos Nós
        const snapshots = cs.newSnapshots.getItems();
        const snapshotNodeIds = new Set(snapshots.map(s => s.node.id));
        for (const n of cs.newNodes.getItems()) {
            assertCoA(n, 'New Node');
            if (!snapshotNodeIds.has(n.id)) {
                throw new DomainError(`New Node ${n.id} sem AccountSnapshot associado (R03)`);
            }
        }

        // R04: Restrição de Snapshot em Nó Inativo
        const inactivatedNodeIds = new Set(cs.inactivatedNodes.getItems().map(n => n.id));
        for (const s of snapshots) {
            assertCoA(s.node, 'Snapshot Node');
            const isToBeInactivated = inactivatedNodeIds.has(s.node.id);
            const isAlreadyInactive = cs.chartOfAccounts.nodes.getItems().some(n => n.id === s.node.id && !n.isActive);
            
            if (isToBeInactivated || isAlreadyInactive) {
                throw new DomainError(`Snapshot ${s.id} associado a nó ${s.node.id} inativo ou em inativação (R04)`);
            }
        }

        // R14: Consistência de Incremento
        const isStructural = transitions.length > 0 || cs.newNodes.count() > 0 || cs.inactivatedNodes.count() > 0;
        if (cs.incrementType === VersionIncrementType.MINOR && isStructural) {
            throw new DomainError(`Changeset MINOR não pode conter transições estruturais (R14)`);
        }
    }

    private validateTransitions(cs: AccountChangeset) {
        const transitions = cs.transitions.getItems();
        const newNodeIds = new Set(cs.newNodes.getItems().map(n => n.id));
        const inactivatedNodeIds = new Set(cs.inactivatedNodes.getItems().map(n => n.id));

        const sourceOneToMany = new Set<string>();
        const targetManyToOne = new Set<string>();
        const nodesWithTargetTypeOne = new Set<string>();
        const nodesWithSourceTypeOne = new Set<string>();

        for (const t of transitions) {
            const meta = TransitionMetadata[t.transitionType];
            const srcId = t.sourceNode?.id;
            const tgtId = t.targetNode?.id;

            // R08: Exclusividade de Origem 1:*
            if (meta.src === 1 && srcId) {
                if (sourceOneToMany.has(srcId)) throw new DomainError(`Nó ${srcId} já é origem em outra transição 1:* (R08)`);
                sourceOneToMany.add(srcId);
                nodesWithSourceTypeOne.add(srcId);
            }

            // R09: Exclusividade de Destino *:1
            if (meta.tgt === 1 && tgtId) {
                if (targetManyToOne.has(tgtId)) throw new DomainError(`Nó ${tgtId} já é destino em outra transição *:1 (R09)`);
                targetManyToOne.add(tgtId);
                nodesWithTargetTypeOne.add(tgtId);
            }

            // R07: Consistência de Transição
            if (meta.tgt !== 0 && tgtId) {
                const isNew = newNodeIds.has(tgtId);
                const isExistingActive = cs.chartOfAccounts.nodes.getItems().some(n => n.id === tgtId && n.isActive);
                if (!isNew && !isExistingActive) {
                    throw new DomainError(`Destino da transição ${t.id} inválido (R07)`);
                }
            }

            if (meta.src !== 0 && srcId) {
                if (!inactivatedNodeIds.has(srcId)) {
                    throw new DomainError(`Origem da transição ${t.id} deve estar nos inativados (R07)`);
                }
            }
        }

        // R05 & R06: Cobertura de Transições
        for (const id of newNodeIds) {
            if (!nodesWithTargetTypeOne.has(id)) throw new DomainError(`New Node ${id} sem transição de destino (R05)`);
        }
        for (const id of inactivatedNodeIds) {
            if (!nodesWithSourceTypeOne.has(id)) throw new DomainError(`Node inativado ${id} sem transição de origem (R06)`);
        }
    }

    private validateHierarchy(cs: AccountChangeset) {
        const inactivatedNodeIds = new Set(cs.inactivatedNodes.getItems().map(n => n.id));
        const allNewNodes = cs.newNodes.getItems();
        const activeNodesOnChart = cs.chartOfAccounts.nodes.getItems();

        // R10: Integridade de Descendência
        for (const nodeId of inactivatedNodeIds) {
            const hasActiveDescendant = activeNodesOnChart.some(n =>
                n.pathLtree.startsWith(nodeId) && n.id !== nodeId && n.isActive && !inactivatedNodeIds.has(n.id)
            );
            if (hasActiveDescendant) {
                throw new DomainError(`Nó ${nodeId} possui descendentes ativos não inativados (R10)`);
            }
        }

        // R11, R12, R13: Paternidade
        const nodesInScope = new Map<string, AccountNode>();
        activeNodesOnChart.forEach(n => nodesInScope.set(n.id, n));
        allNewNodes.forEach(n => nodesInScope.set(n.id, n));
        const newNodesIdsSet = new Set(allNewNodes.map(n => n.id));

        for (const n of allNewNodes) {
            if (!n.parent) continue;
            const parent = nodesInScope.get(n.parent.id);
            if (!parent) throw new DomainError(`Pai do nó ${n.id} não encontrado (R13)`);

            if (!parent.isAbstract) throw new DomainError(`Pai ${parent.id} é analítico (R11)`);
            
            if (!parent.isActive && !newNodesIdsSet.has(parent.id)) {
                throw new DomainError(`Pai ${parent.id} está inativo (R12)`);
            }

            const isParentValid = newNodesIdsSet.has(parent.id) || parent.isActive;
            if (!isParentValid) throw new DomainError(`Gap de linhagem no pai ${parent.id} (R13)`);
        }
    }
}