import { UuidValue } from '../../../shared/value-objects/uuid.value.js';
import { AccountEntity } from '../entities/account.entity.js';
import { AccountExistsException } from '../exceptions/account.exception.js';
import { IAccountRepository } from '../interfaces/account-repository.interface.js';

export abstract class BaseAccountRepository implements IAccountRepository {

    abstract findAll(): Promise<AccountEntity[]>;
    abstract findById(id: UuidValue): Promise<AccountEntity | null>;
    abstract findUsedIndexesByParentId(parentId: UuidValue | null): number[] | Promise<number[]>;
    abstract save(account: AccountEntity): Promise<void>;
    
    async getById(id: UuidValue): Promise<AccountEntity> {
        const account = await this.findById(id);
        if(!account){
            throw new AccountExistsException(id);
        }
        return account;
    }

}
