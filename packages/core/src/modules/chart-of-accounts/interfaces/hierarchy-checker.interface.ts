import { AccountEntity } from "../entities/account.entity.js";
import { AccountClassEnum } from "../enums/account-class.enum.js";

export interface IHierarchyCheckerService {
    existsRootWithSameClass(account: AccountEntity): boolean | Promise<boolean>;

    hasActiveChildren(account: AccountEntity): boolean | Promise<boolean>;

    hasNonContraChildren(account: AccountEntity): boolean | Promise<boolean>;

    isIndexUsedBySiblings(account: AccountEntity): Promise<boolean>;
}