import { AccountEntity } from "../entities/account.entity.js";

export interface IHierarchyCheckerService {
    existsRootWithSameClass(account: AccountEntity): Promise<boolean>;

    hasActiveChildren(account: AccountEntity): Promise<boolean>;

    hasNonContraChildren(account: AccountEntity): Promise<boolean>;

    isIndexUsedBySiblings(account: AccountEntity): Promise<boolean>;
}