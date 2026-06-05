import { AccountEntity } from "../entities/account.entity.js";
import { AccountRepository } from "../interfaces/account-repository.interface.js";
import { IHierarchyCheckerService } from "../interfaces/hierarchy-checker.interface.js";

export class HierarchyCheckerService implements IHierarchyCheckerService {

    constructor(
        private readonly repository: AccountRepository
    ){}

    async existsRootWithSameClass(account: AccountEntity): Promise<boolean> {
        const rootWithSameClass = await this.repository.findRootByClass(account.accountClass);

        return !!rootWithSameClass;
    }
    
    async isIndexUsedBySiblings(account: AccountEntity): Promise<boolean> {
        const conflictingSibling = await this.repository.findByParentAndIndex(account.parent, account.localIndex);

        return !!conflictingSibling;
    }

    async hasActiveChildren(account: AccountEntity): Promise<boolean> {

        if(!account.isSummary) return false;

        const children = await this.repository.findByParent(account);

        return children.some(child => child.isActive);
    }

    async hasNonContraChildren(account: AccountEntity): Promise<boolean> {

        if(!account.isSummary) return false;

        const children = await this.repository.findByParent(account);

        return children.some(child => !child.isContra);
    }

}