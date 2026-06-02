import { DomainException } from '../../../shared/exception/domain.exception.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';

/**
 * Represents a financial account within the `Chart of Accounts`.
 * 
 * See: [Entity Definition: `Account`](docs\domain\chart-of-accounts.md#2-entity-definition-account)
 */
export class AccountEntity {

    private _id!: string;
    private _name!: string;
    private _description?: string;
    private _parent?: AccountEntity;
    private _localIndex!: number; // Tipo numérico garante HTI-09
    private _accountClass!: AccountClassEnum;
    private _isSummary!: boolean;
    private _isContra!: boolean;
    private _isActive!: boolean;

    // Getters
    get id(): string { return this._id; }
    get name(): string { return this._name; }
    get description(): string | undefined { return this._description; }
    get parent(): AccountEntity | undefined { return this._parent; }
    get localIndex(): number { return this._localIndex; }
    get accountClass(): AccountClassEnum { return this._accountClass; }
    get isSummary(): boolean { return this._isSummary; }
    get isContra(): boolean { return this._isContra; }
    get isActive(): boolean { return this._isActive; }

    // Atende HTI-10: Derivação de Código Estrutural
    get structuralCode(): string {
        if (!this._parent) {
            return this._localIndex.toString();
        }
        return `${this._parent.structuralCode}.${this._localIndex}`;
    }


    // Setters controlados

    /**
     * Updates the metadata of the account.
     * @param name The new name of the account.
     * @param description The new description of the account.
     */
    updateMetadata(name: string, description?: string) {
        this._name = name;
        this._description = description;
    }

    /**
     * Activates the account.
     * @throws DomainException if the parent account is inactive. (HTI-07: Restriction of Activity between Parents and Children)
     */
    activate() {
        if (this._parent && !this._parent.isActive) {
            throw new DomainException("HTI-07: Cannot activate an account with an inactive parent.");
        }
        this._isActive = true;
    }
    /**
     * Inactivates the account.
     * 
     * **IMPORTANT:** 
     * This method does not automatically inactivate child accounts. It is the
     * responsibility of the caller to ensure that all child accounts are
     * inactivated before calling this method on the parent account, in order
     * to maintain hierarchical integrity and comply HTI-07: Restriction of Activity between Parents and Children.
     */
    inactivate() {
        // DEVE garantir que todas as contas filhas sejam desativadas também antes de desativar a conta atual
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
        account._description = data.description;
        account._parent = data.parent;
        account._localIndex = data.localIndex;
        account._accountClass = data.accountClass;
        account._isSummary = data.isSummary;
        account._isContra = data.isContra;
        account._isActive = data.isActive;
        return account;
    }

 
    static createChild(data: CreateChildAccountProps): AccountEntity {
        const account = new AccountEntity();

        // Regra de Identidade: Se não vier ID, geramos um novo
        account._id = data.id ?? crypto.randomUUID();

        account._name = data.name;
        account._description = data.description;
        account._parent = data.parent;
        account._localIndex = data.localIndex;
        account._isSummary = data.isSummary;

        // Valores default para campos opcionais na criação
        account._accountClass = data.accountClass ?? data.parent.accountClass;
        account._isContra = data.isContra ?? data.parent.isContra; // Herda do pai por padrão
        account._isActive = data.isActive ?? true;

        // Delega a validação de regras hierárquicas para um método dedicado
        account.validateHierarchicalRules();

        return account;
    }

    
    static createRoot(data: CreateRootAccountProps): AccountEntity {
        const account = new AccountEntity();

        // Regra de Identidade: Se não vier ID, geramos um novo
        account._id = data.id ?? crypto.randomUUID();

        account._name = data.name;
        account._description = data.description;
        account._localIndex = data.localIndex;
        account._isSummary = data.isSummary;
        account._accountClass = data.accountClass;

        // Valores default para campos opcionais na criação
        account._isContra = data.isContra ?? false; 
        account._isActive = data.isActive ?? true;

        // Delega a validação de regras hierárquicas para um método dedicado
        account.validateHierarchicalRules();

        return account;
    }

    private validateHierarchicalRules() {

        if (!this.parent) {
            return;
        }

        // HTI-03: Proibição de auto-referência
        if (this.id === this.parent.id) throw new DomainException("HTI-03: Self-reference prohibited.");

        // HTI-04: Restrição de Paternidade Exclusiva para Contas de Sintéticas 
        if (!this.parent.isSummary) {
            throw new DomainException("HTI-04: Only summary accounts can have child accounts.");
        }

        // HTI-07: Restrição de Atividade entre Pais e Filhos
        if (!this.parent.isActive && this.isActive) {
            throw new DomainException("HTI-07: Inactive parent accounts cannot have active child accounts.");
        }

        // COA-01: Herança de Classe
        if (this.accountClass !== this.parent.accountClass) {
            throw new DomainException("COA-01: Account class must match parent's account class.");
        }

        // COA-02: Propagação de Contra Account
        if (this.parent.isContra && !this.isContra) {
            throw new DomainException("COA-02: Contra account status must propagate to children.");
        }
    }

}

/**
 * Interface defining the properties of an `AccountEntity`.
 * This interface is used for type safety and to define the structure of the data
 * required to create or reconstitute an `AccountEntity`.
 */
export interface AccountProps {
    id: string;
    name: string;
    description?: string;
    parent?: AccountEntity;
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
    parent?: AccountEntity;
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

