import { AccountEntity } from "../entities/account.entity";
import { AccountClassEnum } from "../enums/account-class.enum";

export interface IAccountRepository {

    findByParent(account: AccountEntity): Promise<AccountEntity[]>;

    findRootByClass(accountClass: AccountClassEnum): Promise<AccountEntity | null>;

    isIndexUsedBySiblings(parentId: string | undefined, localIndex: number): Promise<boolean>;

}
