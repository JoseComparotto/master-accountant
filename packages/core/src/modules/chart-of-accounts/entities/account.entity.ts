import { Ensure } from '../../../shared/helpers/assert.helper.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';
import { BalanceTypeEnum } from '../enums/balance-type.enum.js';
import { AccountInvariantViolationException } from '../exceptions/account.exception.js';
import { IHierarchyCheckerService } from '../interfaces/hierarchy-checker.interface.js';
import { StructuralCodeValue } from '../value-objects/structural-code.value.js';
import { UuidValue } from '../../../shared/value-objects/uuid.value.js';
import { AccountNameValue } from '../value-objects/account-name.value.js';

/**
 * Represents a financial account within the `Chart of Accounts`.
 * 
 * See: [Entity Definition: `Account`](docs\domain\chart-of-accounts.md#2-entity-definition-account)
 */
export class AccountEntity {

    private _id!: UuidValue;
    private _name!: AccountNameValue;
    private _description!: string | null;
    private _parent!: AccountEntity | null;
    private _localIndex!: number; // Tipo numérico garante HTI-09
    private _structuralCode!: StructuralCodeValue;
    private _accountClass!: AccountClassEnum;
    private _isSummary!: boolean;
    private _isContra!: boolean;
    private _isActive!: boolean;

    // Getters
    get id(): UuidValue { return this._id; }
    get name(): AccountNameValue { return this._name; }
    get description(): string | null { return this._description; }
    get parent(): AccountEntity | null { return this._parent; }
    get parentId(): UuidValue | null { return this._parent?.id ?? null; }
    get localIndex(): number { return this._localIndex; }
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

    // Alterações controladas
    patchMetadata(patch: AccountMetadataPatch): void {
        if (patch.name !== undefined) this._name = patch.name;
        if (patch.description !== undefined) this._description = patch.description;

        this.validateSchema();
    }

    async applyContraLogic(isContra: boolean, hierarchyChecker: IHierarchyCheckerService): Promise<void> {

        if (!isContra && this.parent?.isContra) {
            throw new AccountInvariantViolationException("COA-02", "Cannot unset Contra status because parent is a Contra account.");
        }

        if (isContra && await hierarchyChecker.hasNonContraChildren(this)) {
            throw new AccountInvariantViolationException("COA-02", "Cannot set contra an account with non-contra children.");
        }

        this._isContra = isContra;

        this.validateSchema();
    }

    /**
     * Activates the account.
     * @throws DomainException if the parent account is inactive. (HTI-07: Restriction of Activity between Parents and Children)
     */
    activate() {
        if (this.parent && !this.parent.isActive) {
            throw new AccountInvariantViolationException("HTI-07", "Cannot activate an account with an inactive parent.");
        }
        this._isActive = true;
    }

    async inactivate(hierarchyChecker: IHierarchyCheckerService) {
        if (await hierarchyChecker.hasActiveChildren(this)) {
            throw new AccountInvariantViolationException("HTI-07", "Cannot inactivate an account with active children.");
        }
        this._isActive = false;
    }

    // Construtor privado para forçar o uso da Factory
    private constructor() { }

    /**
     * Reconstitutes an `AccountEntity` from its persistence state.
     * @param data The persistence state of the account.
     * @returns A new instance of `AccountEntity`.
     */
    static reconstitute(data: AccountProps): AccountEntity {
        const account = new AccountEntity();
        account._id = data.id;
        account._name = data.name;
        account._description = data.description ?? null;
        account._parent = data.parent ?? null;
        account._localIndex = data.localIndex;
        account._structuralCode = data.structuralCode;
        account._accountClass = data.accountClass;
        account._isSummary = data.isSummary;
        account._isContra = data.isContra;
        account._isActive = data.isActive;

        account.validateSchema();

        return account;
    }

    /**
     * Creates a child account.
     * @param data The properties for creating the child account.
     * @returns A new instance of `AccountEntity`.
     */
    static async createChild(data: CreateChildAccountProps, hierarchyChecker: IHierarchyCheckerService): Promise<AccountEntity> {
        const account = new AccountEntity();

        // Regra de Identidade: Se não vier ID, geramos um novo
        account._id = data.id ?? UuidValue.generate();

        account._name = data.name;
        account._parent = data.parent;
        account._localIndex = data.localIndex;
        account._isSummary = data.isSummary;
        account._structuralCode = data.parent.structuralCode.createChild(data.localIndex); // HTI-10: Derivação de Código Estrutural

        // Valores default para campos opcionais na criação
        account._description = data.description ?? null;
        account._accountClass = data.accountClass ?? data.parent.accountClass;
        account._isContra = data.isContra ?? data.parent.isContra; // Herda do pai por padrão
        account._isActive = data.isActive ?? true;

        account.validateSchema();

        // Delega a validação de regras hierárquicas para um método dedicado
        await account.validateHierarchicalRules(hierarchyChecker);

        return account;
    }

    /**
     * Creates a root account.
     * @param data The properties for creating the root account.
     * @returns A new instance of `AccountEntity`.
     */
    static async createRoot(data: CreateRootAccountProps, hierarchyChecker: IHierarchyCheckerService): Promise<AccountEntity> {
        const account = new AccountEntity();

        // Regra de Identidade: Se não vier ID, geramos um novo
        account._id = data.id ?? UuidValue.generate();

        account._parent = null;
        account._name = data.name;
        account._localIndex = data.localIndex;
        account._isSummary = data.isSummary;
        account._accountClass = data.accountClass;
        account._structuralCode = StructuralCodeValue.createRoot(data.localIndex); // HTI-10: Derivação de Código Estrutural

        // Valores default para campos opcionais na criação
        account._description = data.description ?? null;
        account._isContra = data.isContra ?? false;
        account._isActive = data.isActive ?? true;

        // Validação de tipagem e existência de campos obrigatórios
        account.validateSchema();

        // Delega a validação de regras hierárquicas para um método dedicado
        await account.validateHierarchicalRules(hierarchyChecker);

        return account;
    }

    private async validateHierarchicalRules(hierarchyChecker: IHierarchyCheckerService) {

        const isRoot = !this.parent;

        if (isRoot && await hierarchyChecker.existsRootWithSameClass(this)) {
            throw new AccountInvariantViolationException("HTI-01", "Root account already exists for this class.");
        }

        if (await hierarchyChecker.isIndexUsedBySiblings(this)) {
            throw new AccountInvariantViolationException("HTI-08", "Local Index must be unique among siblings.");
        }

        if (isRoot) return; // Non-Root rules:

        // HTI-03: Proibição de auto-referência
        if (UuidValue.isEquals(this.id, this.parentId)) throw new AccountInvariantViolationException("HTI-03", "Self-reference prohibited.");

        // HTI-04: Restrição de Paternidade Exclusiva para Contas de Sintéticas 
        if (!this.parent.isSummary) {
            throw new AccountInvariantViolationException("HTI-04", "Only summary accounts can have child accounts.");
        }

        // HTI-07: Restrição de Atividade entre Pais e Filhos
        if (!this.parent.isActive && this.isActive) {
            throw new AccountInvariantViolationException("HTI-07", "Inactive parent accounts cannot have active child accounts.");
        }

        // COA-01: Herança de Classe
        if (this.accountClass !== this.parent.accountClass) {
            throw new AccountInvariantViolationException("COA-01", "Account class must match parent's account class.");
        }

        // COA-02: Propagação de Contra Account
        if (this.parent.isContra && !this.isContra) {
            throw new AccountInvariantViolationException("COA-02", "Contra account status must propagate to children.");
        }
    }

    // Valida os tipos e obrigatoriedade em runtime
    private validateSchema(): void {
        Ensure.isInstanceOf(this._id, UuidValue, 'id');
        Ensure.isInstanceOf(this._name, AccountNameValue, 'name');
        Ensure.isType(this._description, 'string', 'description', true);
        Ensure.isType(this._localIndex, 'number', 'localIndex');
        Ensure.isInstanceOf(this._parent, AccountEntity, 'parent', true);
        Ensure.isInstanceOf(this._structuralCode, StructuralCodeValue, 'structuralCode');
        Ensure.isEnum(this._accountClass, AccountClassEnum, 'accountClass');
        Ensure.isType(this._isSummary, 'boolean', 'isSummary');
        Ensure.isType(this._isContra, 'boolean', 'isContra');
        Ensure.isType(this._isActive, 'boolean', 'isActive');
    }

    compareTo(other: AccountEntity) {
        return this.structuralCode.compareTo(other.structuralCode);
    }

    public static sortByCode(a: AccountEntity, b: AccountEntity) {
        return a.compareTo(b);
    }

}

/**
 * Interface defining the properties of an `AccountEntity`.
 * This interface is used for type safety and to define the structure of the data
 * required to create or reconstitute an `AccountEntity`.
 */
export interface AccountProps {
    id: UuidValue;
    name: AccountNameValue;
    description: string | null;
    parent: AccountEntity | null;
    structuralCode: StructuralCodeValue;
    localIndex: number;
    accountClass: AccountClassEnum;
    isSummary: boolean;
    isContra: boolean;
    isActive: boolean;
}

type BaseCreateProps = Pick<AccountProps, 'name' | 'localIndex' | 'isSummary'> &
    Partial<Pick<AccountProps, 'id' | 'description' | 'isContra' | 'isActive'>>;

/**
* Interface defining the properties required to create a new `AccountEntity`.
*/
export type CreateAccountProps = BaseCreateProps & {
    parent: AccountEntity | null;
    accountClass?: AccountClassEnum;
};

export type CreateRootAccountProps = BaseCreateProps & {
    parent?: never;
    accountClass: AccountClassEnum;
};

export type CreateChildAccountProps = BaseCreateProps & {
    parent: AccountEntity;
    accountClass?: AccountClassEnum;
};

export type AccountMetadataPatch = Partial<Pick<AccountProps, 'name' | 'description'>>;
