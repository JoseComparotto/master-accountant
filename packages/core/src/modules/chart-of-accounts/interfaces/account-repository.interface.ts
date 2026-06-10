import { UuidValue } from '../../../shared/value-objects/uuid.value.js';
import { AccountEntity } from '../entities/account.entity.js';

export interface IAccountRepository {

    findAll(): Promise<AccountEntity[]>;

    findById(id: UuidValue): Promise<AccountEntity | null>;

    findUsedIndexesByParentId(parentId: UuidValue | null): number[] | Promise<number[]>;

    save(account: AccountEntity): Promise<void>;

}
