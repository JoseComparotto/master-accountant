import { Injectable } from "@nestjs/common";
import { AccountEntity, AccountProps, StructuralCodeValue } from "@repo/core";
import { AccountClassEnum } from "@repo/core";
import { IAccountRepository } from "@repo/core";

// TODO: Substituir mock por ORM

@Injectable()
export class MockAccountRepository implements IAccountRepository {

    private accounts: AccountEntity[] = [];

    constructor() {
        const commonProps = { isSummary: true, isContra: false, isActive: true };

        const rootDefinitions = [
            { name: 'ATIVO', class: AccountClassEnum.ASSET },               // ID: 00000000-0000-4000-8000-000000000001
            { name: 'PASSIVO', class: AccountClassEnum.LIABILITY },         // ID: 00000000-0000-4000-8000-000000000002
            { name: 'PATRIMÔNIO LÍQUIDO', class: AccountClassEnum.EQUITY }, // ID: 00000000-0000-4000-8000-000000000003
            { name: 'RECEITAS', class: AccountClassEnum.INCOME },          // ID: 00000000-0000-4000-8000-000000000004
            { name: 'DESPESAS', class: AccountClassEnum.EXPENSE },          // ID: 00000000-0000-4000-8000-000000000005
        ];

        this.accounts = rootDefinitions.map((def, index) => {
            const sequence = index + 1;
            // Gera: 00000000-0000-4000-8000-000000000001, etc.
            const mockId = `00000000-0000-4000-8000-${sequence.toString().padStart(12, '0')}`;

            return AccountEntity.reconstitute({
                ...commonProps,
                id: mockId,
                name: def.name,
                parent: null,
                description:null,
                accountClass: def.class,
                localIndex: sequence,
                structuralCode: StructuralCodeValue.createRoot(sequence),
            });
        });
    }

    async findAll(): Promise<AccountEntity[]> {
        return this.accounts;
    }

    async findById(id: string): Promise<AccountEntity | null> {
        return this.accounts.find(account => account.id === id) || null;
    }

    async findByParent(account: AccountEntity): Promise<AccountEntity[]> {
        return this.accounts.filter(acc => acc.parent?.id === account.id);
    }

    async findLastLocalIndex(parentId: string | null): Promise<number> {
        const siblings = parentId
            ? this.accounts.filter(acc => (acc.parent?.id ?? null) === parentId)
            : this.accounts.filter(acc => !acc.parent);
        return siblings.reduce((max, acc) => acc.localIndex > max ? acc.localIndex : max, 0);
    }

    async findRootByClass(accountClass: AccountClassEnum): Promise<AccountEntity | null> {
        return this.accounts.find(acc => acc.accountClass === accountClass && !acc.parent) || null;
    }

    async findByParentAndIndex(parent: AccountEntity | null, localIndex: number): Promise<AccountEntity | null> {
        const parentId = parent?.id ?? null;
        return this.accounts.find(acc => acc.parent?.id === parentId && acc.localIndex === localIndex) ?? null;
    }

    async save(account: AccountEntity): Promise<void> {
        const index = this.accounts.findIndex(acc => acc.id === account.id);
        if (index !== -1) {
            this.accounts[index] = account;
        } else {
            this.accounts.push(account);
        }
    }
}