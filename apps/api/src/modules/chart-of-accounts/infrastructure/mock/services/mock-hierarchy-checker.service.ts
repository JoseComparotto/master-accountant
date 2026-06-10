import { Inject } from "@nestjs/common";
import { AccountEntity, type IAccountRepository, IHierarchyCheckerService, UuidValue } from "@repo/core";

export class MockHierarchyCheckerService implements IHierarchyCheckerService {

    constructor(
        @Inject('IAccountRepository')
        private readonly repo: IAccountRepository
    ) { }

    async existsRootWithSameClass(account: AccountEntity): Promise<boolean> {
        const accounts = await this.repo.findAll();
        return accounts.some(acc => acc.parentId === null && acc.accountClass === account.accountClass);
    }
    async hasActiveChildren(account: AccountEntity): Promise<boolean> {
        const accounts = await this.repo.findAll();
        return accounts.some(acc => UuidValue.isEquals(acc.parentId, account.id) && acc.isActive)
    }
    async hasNonContraChildren(account: AccountEntity): Promise<boolean> {
        const accounts = await this.repo.findAll();
        return accounts.some(acc => UuidValue.isEquals(acc.parentId, account.id) && !acc.isContra)
    }
    async isIndexUsedBySiblings(account: AccountEntity): Promise<boolean> {
        const accounts = await this.repo.findAll();
        return accounts.some(acc =>
            UuidValue.isEquals(acc.parentId, account.parentId)
            && acc.localIndex === account.localIndex
        )
    }
}