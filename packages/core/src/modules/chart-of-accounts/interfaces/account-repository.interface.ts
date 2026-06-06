import { UuidValue } from '../../../shared/value-objects/uuid.value.js';
import { AccountEntity } from '../entities/account.entity.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';

export interface IAccountRepository {
    
    findAll(): Promise<AccountEntity[]>;
    
    findById(id: UuidValue): Promise<AccountEntity | null>;
    
    findByParent(account: AccountEntity): Promise<AccountEntity[]>;
    
    findLastLocalIndex(parentId: UuidValue | null): Promise<number>;
    
    findRootByClass(accountClass: AccountClassEnum): Promise<AccountEntity | null>;
    
    findByParentAndIndex(parent: AccountEntity | null, localIndex: number): Promise<AccountEntity | null>;
    
    save(account: AccountEntity): Promise<void>;

}
