import { Injectable } from "@nestjs/common";
import { AccountEntity, AccountProps } from "@repo/core";
import { AccountClassEnum } from "@repo/core";
import { IAccountRepository } from "@repo/core";

@Injectable()
export class MockAccountRepository implements IAccountRepository {

    private accounts: AccountEntity[] = [];

    constructor() {

        // Initialize with some mock data
        const rootProps: AccountProps[] = [
            {
                id: "2f587bb3-d427-4b5f-be45-5dca5a2d8b18",
                name: 'ATIVO',
                accountClass: AccountClassEnum.ASSET,
                localIndex: 1,
                isSummary: true,
                isContra: false,
                isActive: true
            },
            {
                id: "094df684-33ef-4d83-9413-0a78e47f7191",
                name: 'PASSIVO',
                accountClass: AccountClassEnum.LIABILITY,
                localIndex: 2,
                isSummary: true,
                isContra: false,
                isActive: true
            },
            {
                id: "3d7702d1-5155-479a-8696-d65e9b5d0c8a",
                name: 'PATRIMÔNIO LÍQUIDO',
                accountClass: AccountClassEnum.EQUITY,
                localIndex: 3,
                isSummary: true,
                isContra: false,
                isActive: true
            },
            {
                id: "00ad0474-b6f3-484d-95c1-ccec6ed2bc25",
                name: 'RECEITAS',
                accountClass: AccountClassEnum.REVENUE,
                localIndex: 4,
                isSummary: true,
                isContra: false,
                isActive: true
            },
            {
                id: "e7111777-51e3-4ded-9803-483b344b2812",
                name: 'DESPESAS',
                accountClass: AccountClassEnum.EXPENSE,
                localIndex: 5,
                isSummary: true,
                isContra: false,
                isActive: true
            }
        ];
        this.accounts = rootProps.map(AccountEntity.reconstitute);

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

    async findLastLocalIndex(parentId?: string): Promise<number> {
        const siblings = parentId
            ? this.accounts.filter(acc => acc.parent?.id === parentId)
            : this.accounts.filter(acc => !acc.parent);
        return siblings.reduce((max, acc) => acc.localIndex > max ? acc.localIndex : max, 0);
    }

    async findRootByClass(accountClass: AccountClassEnum): Promise<AccountEntity | null> {
        return this.accounts.find(acc => acc.accountClass === accountClass && !acc.parent) || null;
    }

    async isIndexUsedBySiblings(parentId: string | undefined, localIndex: number): Promise<boolean> {
        return this.accounts.some(acc => acc.parent?.id === parentId && acc.localIndex === localIndex);
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