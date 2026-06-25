import { AttributeImmutableViolationException, DomainInvariantViolationException, UuidValue } from "@repo/shared-core";
import { AccountCollection } from "../collections/account.collection.js";
import { ChartOfAccountsEntity, CreateAccountInput, UpdateAccountInput, UpdateAccountInputWithId, UpdateAccountsInput } from "../entities/chart-of-accounts.entity.js";
import { AccountEntity } from "../entities/account.entity.js";
import { AccountNameValue } from "../value-objects/account-name.value.js";
import { MUTABLE_FIELDS } from "../constants/account-mutable-fieds.constant.js";

export class AccountsUpdateBatchPipeline {
    constructor(private readonly _collection: AccountCollection) { }

    public execute(chart: ChartOfAccountsEntity, target: UpdateAccountsInput): void {
        // =========================================================================
        // 1. FAIL-FIRST
        // =========================================================================

        // 1.1. Garantir que não há intenção de deleção
        const targetIds = new Set(target.filter(t => t.id).map(t => t.id!.value));
        const hasToRemove = this._collection.someId(id => !targetIds.has(id));
        if (hasToRemove) {
            throw new DomainInvariantViolationException("AUD-01", "Accounts MUST NOT to be deleted.");
        }

        type Common = {
            account?: AccountEntity;
            diffMap?: Record<keyof UpdateAccountInput, boolean>;
            depth: number;
        };
        type EnrichedNewItem = {
            target: CreateAccountInput;
            isNew: true;
        } & Common;
        type EnrichedExistingItem = {
            target: UpdateAccountInputWithId;
            isNew: false;
        } & Common;

        const targetMapById = new Map<string, typeof target[number]>();
        for (const t of target) {
            if (t.id) targetMapById.set(t.id.value, t);
        }

        // Função para calcular a profundidade na árvore (essencial para as ordenações)
        const calculateDepth = (t: typeof target[number]): number => {
            if (!('parentId' in t) || !t.parentId) return 0;

            if (this._collection.hasId(t.parentId)) {
                let depth = 1;
                let current = this._collection.getById(t.parentId);
                while (current.parentId !== null) {
                    depth++;
                    current = this._collection.getById(current.parentId);
                }
                return depth;
            }

            const parentTarget = targetMapById.get(t.parentId.value);
            if (parentTarget) return calculateDepth(parentTarget) + 1;

            return 0;
        };

        const existingItems: EnrichedExistingItem[] = [];
        const newItems: EnrichedNewItem[] = [];

        // 1.2. Garantir que não há intenção de mutação de campos imutáveis
        for (const t of target) {
            const isNew = !t.id || !this._collection.hasId(t.id);
            const depth = calculateDepth(t);

            if (isNew) {
                newItems.push({ target: t as CreateAccountInput, isNew, depth });
            } else {
                const ut = t as UpdateAccountInputWithId;

                const account = this._collection.getById(ut.id!);

                const diffMap: Record<keyof UpdateAccountInput, boolean> = {
                    parentId: !UuidValue.isEquals(ut.parentId, account.parentId),
                    name: !AccountNameValue.isEquals(ut.name, account.name),
                    description: ut.description !== account.description,
                    localIndex: ut.localIndex !== account.localIndex,
                    accountClass: ut.accountClass !== account.accountClass,
                    isSummary: ut.isSummary !== account.isSummary,
                    isContra: ut.isContra !== account.isContra,
                    isActive: ut.isActive !== account.isActive,
                };

                const violation = Object.keys(diffMap)
                    .find(k => diffMap[k as keyof UpdateAccountInput] && !MUTABLE_FIELDS.has(k as keyof UpdateAccountInput));
                if (violation) {
                    throw new AttributeImmutableViolationException(violation);
                }

                existingItems.push({ target: ut, isNew, account, diffMap, depth });
            }
        }

        // Snapshot para rollback preventivo
        const snapshot = this._collection.clone();

        try {
            // =========================================================================
            // 2. EXECUTAR AS INTENÇÕES DE UPDATES SEM RESTRIÇÃO DE ORDEM (Apenas Existentes)
            // =========================================================================
            for (const item of existingItems) {
                if (!item.account || !item.diffMap) continue;

                if (item.diffMap.name) {
                    item.account.name = item.target.name;
                }
                if (item.diffMap.description) {
                    item.account.description = item.target.description;
                }
            }

            // =========================================================================
            // 3. UPDATES DOWN-TO-TOP (Ordenação Decrescente: Filhos primeiro - Apenas Existentes)
            // =========================================================================
            const bottomUpItems = existingItems.filter(item => {
                if (!item.diffMap) return false;
                const vaiInativar = item.diffMap.isActive && item.target.isActive === false;
                const vaiVirarContra = item.diffMap.isContra && item.target.isContra === true;
                return vaiInativar || vaiVirarContra;
            });

            bottomUpItems.sort((a, b) => b.depth - a.depth);

            for (const item of bottomUpItems) {
                const acc = item.account!;
                const dm = item.diffMap!;

                if (dm.isContra && item.target.isContra === true) {
                    acc.convertToContra();
                }
                if (dm.isActive && item.target.isActive === false) {
                    acc.inactivate();
                }
            }

            // =========================================================================
            // 4. UPDATES TOP-TO-DOWN (Ordenação Crescente: Pais primeiro - Apenas Existentes)
            // =========================================================================
            const topDownItems = existingItems.filter(item => {
                if (!item.diffMap) return false;
                const vaiAtivar = item.diffMap.isActive && item.target.isActive === true;
                const vaiVirarNormal = item.diffMap.isContra && item.target.isContra === false;
                return vaiAtivar || vaiVirarNormal;
            });

            topDownItems.sort((a, b) => a.depth - b.depth);

            for (const item of topDownItems) {
                const acc = item.account!;
                const dm = item.diffMap!;

                if (dm.isActive && item.target.isActive === true) {
                    acc.activate();
                }
                if (dm.isContra && item.target.isContra === false) {
                    acc.convertToNormal();
                }
            }

            // =========================================================================
            // 5. CRIAÇÃO DE NOVAS CONTAS (Ordenação Crescente: Pais primeiro - Apenas Novas)
            // =========================================================================
            // Ordenamos do menor depth para o maior. Se o payload trouxer um pai novo 
            // e um filho novo, o pai novo (menor depth) será criado primeiro.
            newItems.sort((a, b) => a.depth - b.depth);

            for (const item of newItems) {
                chart.createAccount(item.target);
            }

        } catch (e) {
            this._collection.restore(snapshot);
            throw e;
        }
    }
}