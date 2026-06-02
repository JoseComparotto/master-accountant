import { AccountEntity } from '../entities/account.entity.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';

export interface IAccountRepository {

    findAll(): Promise<AccountEntity[]>;

    findById(id: string): Promise<AccountEntity | null>;

    findByParent(account: AccountEntity): Promise<AccountEntity[]>;

    findLastLocalIndex(parentId?: string): Promise<number>;

    findRootByClass(accountClass: AccountClassEnum): Promise<AccountEntity | null>;

    isIndexUsedBySiblings(parentId: string | undefined, localIndex: number): Promise<boolean>;

    save(account: AccountEntity): Promise<void>;

}
