import { AccountEntity } from '../entities/account.entity.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';
import { AccountExistsException } from '../exceptions/account.exception.js';

export abstract class AccountRepository {
    
    abstract findAll(): Promise<AccountEntity[]>;
    
    abstract findById(id: string): Promise<AccountEntity | null>;
    
    abstract findByParent(account: AccountEntity): Promise<AccountEntity[]>;
    
    abstract findLastLocalIndex(parentId: string | null): Promise<number>;
    
    abstract findRootByClass(accountClass: AccountClassEnum): Promise<AccountEntity | null>;
    
    abstract findByParentAndIndex(parent: AccountEntity | null, localIndex: number): Promise<AccountEntity | null>;
    
    abstract save(account: AccountEntity): Promise<void>;

    async getById(id: string): Promise<AccountEntity> {
        const account = await this.findById(id);
        if(!account){
            throw new AccountExistsException(id);
        }
        return account;
    }

}
