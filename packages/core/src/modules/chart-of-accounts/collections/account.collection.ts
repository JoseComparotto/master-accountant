import { UuidValue } from "../../../shared/index.js";
import { StructuralCodeValue } from "../value-objects/structural-code.value.js";
import { AccountEntity } from "../entities/account.entity.js";
import {
    AccountNotExistsWithIdException,
    AccountNotExistsWithCodeException,
    DuplicatedAccountCodeException,
    DuplicatedAccountIdException
} from "../exceptions/account.exception.js";

export class AccountCollection {
    private readonly _accountsById: Map<UuidValue['value'], AccountEntity> = new Map();
    private readonly _accountsByCode: Map<StructuralCodeValue['value'], AccountEntity> = new Map();
    private readonly _accountsByParentId: Map<UuidValue['value'] | null, AccountEntity[]> = new Map();

    public constructor() { }

    public static fromAccounts(accounts: AccountEntity[]): AccountCollection {
        const collection = new AccountCollection();
        for (const account of accounts) {
            collection.register(account);
        }
        collection.validateGeneralReferencialIntegrity();
        return collection;
    }

    public add(account: AccountEntity) {
        this.validateParentExists(account);
        this.register(account);
    }

    private register(account: AccountEntity) {
        this.validateUniqueId(account);
        this.validateUniqueCode(account);

        this._accountsById.set(account.id.value, account);
        this._accountsByCode.set(account.structuralCode.value, account);

        const parentIdValue = account.parentId?.value ?? null;
        const siblings = this._accountsByParentId.get(parentIdValue) ?? [];
        siblings.push(account);
        this._accountsByParentId.set(parentIdValue, siblings);
    }

    public getAll(): AccountEntity[] {
        return [...this._accountsById.values()];
    }

    public hasId(id: UuidValue): boolean {
        return this._accountsById.has(id.value);
    }

    public getById(id: UuidValue): AccountEntity {
        const account = this._accountsById.get(id.value);
        if (!account) throw new AccountNotExistsWithIdException(id.value);
        return account;
    }

    public findById(id: UuidValue): AccountEntity | null {
        return this._accountsById.get(id.value) ?? null;
    }

    public getByCode(code: StructuralCodeValue): AccountEntity {
        const account = this._accountsByCode.get(code.value);
        if (!account) throw new AccountNotExistsWithCodeException(code.value);
        return account;
    }

    public getByParentId(id: UuidValue | null): AccountEntity[] {
        const children = this._accountsByParentId.get(id?.value ?? null) ?? [];
        return [...children];
    }

    private validateGeneralReferencialIntegrity() {
        const parentIds = [...this._accountsByParentId.keys()];
        const violation = parentIds.find(p => p !== null && !this._accountsById.has(p))
        if (violation)
            throw new AccountNotExistsWithIdException(violation);
    }

    private validateParentExists(account: { parentId: UuidValue | null }) {
        if (account.parentId !== null && !this._accountsById.has(account.parentId.value))
            throw new AccountNotExistsWithIdException(account.parentId.value);
    }

    private validateUniqueCode(props: { structuralCode: StructuralCodeValue }) {
        if (this._accountsByCode.has(props.structuralCode.value))
            throw new DuplicatedAccountCodeException(props.structuralCode);
    }

    private validateUniqueId(props: { id: UuidValue }) {
        if (this._accountsById.has(props.id.value))
            throw new DuplicatedAccountIdException(props.id.value);
    }

}