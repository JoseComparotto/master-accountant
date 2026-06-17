import { Ensure, UuidValue } from '@repo/shared-core';
import { AccountClassEnum } from '../enums/account-class.enum.js';
import { BalanceTypeEnum } from '../enums/balance-type.enum.js';
import { StructuralCodeValue } from '../value-objects/structural-code.value.js';
import { AccountNameValue } from '../value-objects/account-name.value.js';

export interface AccountProps {
    chartId: UuidValue;

    id: UuidValue;
    name: AccountNameValue;
    description: string | null;
    parentId: UuidValue | null;
    structuralCode: StructuralCodeValue;
    accountClass: AccountClassEnum;
    isSummary: boolean;
    isContra: boolean;
    isActive: boolean;
}

export class AccountEntity {

    private _chartId!: UuidValue;

    private _id!: UuidValue;
    private _name!: AccountNameValue;
    private _description!: string | null;
    private _parentId!: UuidValue | null;
    private _structuralCode!: StructuralCodeValue;
    private _accountClass!: AccountClassEnum;
    private _isSummary!: boolean;
    private _isContra!: boolean;
    private _isActive!: boolean;

    get chartId(): UuidValue { return this._chartId; }

    get id(): UuidValue { return this._id; }
    get name(): AccountNameValue { return this._name; }
    get description(): string | null { return this._description; }
    get parentId(): UuidValue | null { return this._parentId; }
    get localIndex(): number { return this._structuralCode.localIndex; }
    get structuralCode(): StructuralCodeValue { return this._structuralCode; }
    get accountClass(): AccountClassEnum { return this._accountClass; }
    get isSummary(): boolean { return this._isSummary; }
    get isContra(): boolean { return this._isContra; }
    get isActive(): boolean { return this._isActive; }

    get balanceType(): BalanceTypeEnum {
        const isNormalDebit = [
            AccountClassEnum.ASSET, AccountClassEnum.EXPENSE
        ].includes(this.accountClass);

        const isDebit = isNormalDebit !== this.isContra; // XOR

        return isDebit ? BalanceTypeEnum.DEBIT : BalanceTypeEnum.CREDIT
    }

    set name(newName: AccountNameValue) {
        Ensure.isInstanceOf(newName, AccountNameValue, 'name');
        this._name = newName;
    }

    set description(newDescription: string | null) {
        Ensure.isType(newDescription, 'string', 'description', true);
        this._description = newDescription;
    }

    convertToContra() { this._isContra = true; }
    convertToNormal() { this._isContra = false; }

    activate() { this._isActive = true; }
    inactivate() { this._isActive = false; }

    private constructor() { }

    static reconstitute(data: AccountProps): AccountEntity {

        const account = new AccountEntity();

        account._chartId = data.chartId;

        account._id = data.id;
        account._name = data.name;
        account._description = data.description ?? null;
        account._parentId = data.parentId ?? null;
        account._structuralCode = data.structuralCode;
        account._accountClass = data.accountClass;
        account._isSummary = data.isSummary;
        account._isContra = data.isContra;
        account._isActive = data.isActive;

        account.validateSchema();

        return account;
    }

    static createChild(data: CreateChildAccountProps): AccountEntity {
        const account = new AccountEntity();

        account._chartId = data.chartId;

        account._id = data.id ?? UuidValue.generate();
        account._name = data.name;
        account._parentId = data.parentId;
        account._description = data.description ?? null;
        account._isSummary = data.isSummary;
        account._structuralCode = data.structuralCode;
        account._accountClass = data.accountClass;
        account._isContra = data.isContra;
        account._isActive = data.isActive;

        account.validateSchema();

        return account;
    }

    static createRoot(data: CreateRootAccountProps): AccountEntity {
        const account = new AccountEntity();

        account._chartId = data.chartId;

        account._id = data.id ?? UuidValue.generate();
        account._name = data.name;
        account._parentId = null;
        account._accountClass = data.accountClass;
        account._structuralCode = data.structuralCode;

        // Valores default para campos opcionais na criação
        account._description = data.description ?? null;
        account._isSummary = data.isSummary ?? true;
        account._isContra = data.isContra ?? false;
        account._isActive = data.isActive ?? true;

        // Validação de tipagem e existência de campos obrigatórios
        account.validateSchema();

        return account;
    }

    // Valida os tipos e obrigatoriedade em runtime
    private validateSchema(): void {
        Ensure.isInstanceOf(this._id, UuidValue, 'id');
        Ensure.isInstanceOf(this._parentId, UuidValue, 'parentId', true);
        Ensure.isInstanceOf(this._name, AccountNameValue, 'name');
        Ensure.isType(this._description, 'string', 'description', true);
        Ensure.isInstanceOf(this._structuralCode, StructuralCodeValue, 'structuralCode');
        Ensure.isEnum(this._accountClass, AccountClassEnum, 'accountClass');
        Ensure.isType(this._isSummary, 'boolean', 'isSummary');
        Ensure.isType(this._isContra, 'boolean', 'isContra');
        Ensure.isType(this._isActive, 'boolean', 'isActive');
    }

    compareTo(other: AccountEntity) {
        return this.structuralCode.compareTo(other.structuralCode);
    }

}

export type CreateAccountProps =
    & Partial<AccountProps>
    & Pick<AccountProps, 'chartId' | 'name' | 'structuralCode' | 'accountClass'>;

export type CreateRootAccountProps = Omit<CreateAccountProps, 'parentId'>;

export type CreateChildAccountProps = Omit<CreateAccountProps, 'parentId'>
    & { parentId: NonNullable<AccountProps['parentId']> }
    & Pick<AccountProps, 'isSummary' | 'isContra' | 'isActive'>;