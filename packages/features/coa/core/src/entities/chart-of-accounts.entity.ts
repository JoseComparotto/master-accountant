import { AtributeConstraintViolationException, AttributeImmutableViolationException, UuidValue } from "@repo/shared-core";
import { AccountCollection } from "../collections/account.collection.js";
import { StructuralCodeValue } from "../value-objects/structural-code.value.js";
import { VersionValue } from "../value-objects/version.value.js";
import {
    AccountInvariantViolationException,
    DuplicatedAccountCodeException
} from "../exceptions/account.exception.js";
import {
    AccountEntity,
    AccountProps,
    CreateAccountProps,
    CreateChildAccountProps,
    CreateRootAccountProps,
} from "./account.entity.js";
import { AccountNameValue } from "../value-objects/account-name.value.js";
import { canActivateAccount, canInactivateAccount } from "../rules/account.rules.js";

const MUTABLE_FIELDS = new Set<keyof UpdateAccountInput>([
    'name',
    'description',
    'isContra',
    'isActive',
]);
export class ChartOfAccountsEntity {

    private constructor(
        private readonly _id: UuidValue,
        private readonly _collection: AccountCollection,
        private readonly _version: VersionValue
    ) { }

    public get id() { return this._id; }
    public get version() { return this._version; }

    public get roots(): Readonly<AccountEntity>[] {
        return this._collection.getByParentId(null);
    }

    public get accounts(): Readonly<AccountEntity>[] {
        return this._collection.getAll();
    }

    public hasAccountId(id: UuidValue): boolean {
        return this._collection.hasId(id);
    }

    public findAccountById(id: UuidValue): Readonly<AccountEntity> | null {
        return this._collection.findById(id);
    }

    public getAccountById(id: UuidValue): Readonly<AccountEntity> {
        return this._collection.getById(id);
    }

    public getAccountByCode(code: StructuralCodeValue): Readonly<AccountEntity> {
        return this._collection.getByCode(code);
    }

    public getAccountsByParentId(parentId: UuidValue): Readonly<AccountEntity>[] {
        return this._collection.getByParentId(parentId);
    }

    public static create(id?: UuidValue): ChartOfAccountsEntity {

        const emptyCollection = new AccountCollection();

        const initialVersion = VersionValue.initial();

        return new ChartOfAccountsEntity(
            id ?? UuidValue.generate(),
            emptyCollection,
            initialVersion
        );
    }

    public static reconstitute(id: UuidValue, accountsProps: AccountProps[], version: VersionValue): ChartOfAccountsEntity {
        const accounts = accountsProps.map(AccountEntity.reconstitute);
        const collection = AccountCollection.fromAccounts(accounts);
        return new ChartOfAccountsEntity(id, collection, version);
    }

    public createAccount(input: CreateAccountInput): Readonly<AccountEntity> {

        const { parentId, accountClass, isSummary, ...commonProps } = input;

        if (!parentId && accountClass === undefined)
            throw new AtributeConstraintViolationException(
                'accountClass', 'Root accounts must have an account class defined.'
            );
        if (parentId && isSummary === undefined)
            throw new AtributeConstraintViolationException(
                'accountClass', 'Child accounts must have an is-summary defined.'
            );

        const account = parentId
            ? this.createChildAccount({
                ...commonProps,
                parentId,
                accountClass,
                isSummary: isSummary!
            })
            : this.createRootAccount({
                ...commonProps,
                accountClass: accountClass!,
                isSummary
            });

        return account;
    }

    public createRootAccount(input: CreateRootAccountInput): Readonly<AccountEntity> {
        this.validateRootAccountCandidate(input);

        const structuralCode = StructuralCodeValue.createRoot(
            input.localIndex ?? this.calculateNextLocalIndex(this.roots)
        );

        const account = AccountEntity.createRoot({
            chartId: this.id,
            id: input.id,
            structuralCode,
            name: input.name,
            description: input.description,
            accountClass: input.accountClass,
            isSummary: input.isSummary,
            isContra: input.isContra,
            isActive: input.isActive
        });

        this._collection.add(account);

        return account;
    }

    public createChildAccount(input: CreateChildAccountInput): Readonly<AccountEntity> {

        const parent: AccountEntity = this._collection.getById(input.parentId);

        this.validateChildAccountCandidate(input, parent);

        const structuralCode = this.generateCode(parent, input.localIndex);

        const account = AccountEntity.createChild({
            chartId: this.id,
            id: input.id,
            structuralCode,
            name: input.name,
            description: input.description,
            parentId: input.parentId,
            accountClass: input.accountClass ?? parent.accountClass,
            isSummary: input.isSummary,
            isContra: input.isContra ?? parent.isContra,
            isActive: input.isActive ?? parent.isActive
        });

        this._collection.add(account);

        return account;
    }


    public updateAccount(accountId: UuidValue, target: UpdateAccountInput): Readonly<AccountEntity> {
        type FieldName = keyof UpdateAccountInput;

        const account = this._collection.getById(accountId);

        const diffMap: Record<FieldName, boolean> = {
            chartId: !UuidValue.isEquals(target.parentId, account.parentId),
            parentId: !UuidValue.isEquals(target.parentId, account.parentId),
            name: !AccountNameValue.isEquals(target.name, account.name),
            description: target.description !== account.description,
            localIndex: target.localIndex !== account.localIndex,
            accountClass: target.accountClass !== account.accountClass,
            isSummary: target.isSummary !== account.isSummary,
            isContra: target.isContra !== account.isContra,
            isActive: target.isActive !== account.isActive,
        };

        const violation = Object.keys(diffMap)
            .find(k => diffMap[k as FieldName] && !MUTABLE_FIELDS.has(k as FieldName));
        if (violation) {
            throw new AttributeImmutableViolationException(violation);
        }

        if (diffMap.name) {
            account.name = target.name;
        }

        if (diffMap.description) {
            account.description = target.description;
        }

        if (diffMap.isContra) {
            if (target.isContra) account.convertToContra();
            else account.convertToNormal();
        }

        if (diffMap.isActive) {
            if (target.isActive) account.activate();
            else account.inactivate();
        }

        return account;
    }

    public updateAccountName(accountId: UuidValue, newName: AccountNameValue): Readonly<AccountEntity> {
        const account = this._collection.getById(accountId);
        account.name = newName;
        return account;
    }

    public updateAccountDescription(accountId: UuidValue, newDescription: string | null): Readonly<AccountEntity> {
        const account = this._collection.getById(accountId);
        account.description = newDescription;
        return account;
    }

    public inactivateAccount(id: UuidValue): void {
        const account = this._collection.getById(id);

        const children = this._collection.getByParentId(account.id);
        const { can, reasons } = canInactivateAccount({
            hasAnyActiveChild: children.some(c => c.isActive),
            isAlreadyInactive: !account.isActive
        });

        if (!can)
            throw new AccountInvariantViolationException(
                "HTI-07", `Cannot inactivate account: ${reasons.join(', ')}`
            );

        account.inactivate();
    }

    public activateAccount(id: UuidValue): void {
        const account = this._collection.getById(id);

        const parent = account.parentId ? this._collection.getById(account.parentId) : null;

        const { can, reasons } = canActivateAccount({
            isAlreadyActive: account.isActive,
            isParentInactive: !!parent && !parent.isActive
        });

        if (!can)
            throw new AccountInvariantViolationException(
                "HTI-07", `Cannot activate account: ${reasons.join(', ')}`
            );

        account.activate();
    }

    public convertToNormalAccount(id: UuidValue): void {
        const account = this._collection.getById(id);
        if (!account.isContra) return;

        const parent = account.parentId ? this._collection.getById(account.parentId) : null;
        if (parent && parent.isContra)
            throw new AccountInvariantViolationException(
                "COA-02", "Cannot convert to normal an account with contra account parent."
            );

        account.convertToNormal();
    }

    public convertToContraAccount(id: UuidValue): void {
        const account = this._collection.getById(id);
        if (account.isContra) return;

        const children = this._collection.getByParentId(account.id);
        const hasNormalChildren = children.some(c => !c.isContra);

        if (hasNormalChildren)
            throw new AccountInvariantViolationException(
                "COA-02", "Cannot convert to contra an account that has normal child accounts."
            );

        account.convertToContra();
    }

    private generateCode(parent: AccountEntity, localIndex?: number): StructuralCodeValue {
        const siblings = this._collection.getByParentId(parent.id);

        if (localIndex !== undefined)
            this.validateUniqueLocalIndex(siblings, localIndex);

        const finalLocalIndex = localIndex ?? this.calculateNextLocalIndex(siblings);
        return parent.structuralCode.createChild(finalLocalIndex);
    }

    private validateUniqueLocalIndex(siblings: AccountEntity[], localIndex: number): void {
        const conflictSibling = siblings.find(s => s.localIndex === localIndex);
        if (conflictSibling)
            throw new DuplicatedAccountCodeException(conflictSibling.structuralCode);
    }

    private calculateNextLocalIndex(siblings: Readonly<AccountEntity>[]): number {
        const lastUsed = siblings.reduce((max, s) => s.localIndex > max ? s.localIndex : max, 0);
        return lastUsed + 1;
    }

    private validateRootAccountCandidate(input: CreateRootAccountInput) {
        const existsRootWithSameClass = this.roots.some(r => r.accountClass === input.accountClass);
        if (existsRootWithSameClass)
            throw new AccountInvariantViolationException("HTI-01", "Root account already exists for this class.");
    }

    private validateChildAccountCandidate(child: CreateChildAccountInput, parent: AccountEntity) {

        if (UuidValue.isEquals(child.id, parent.id))
            throw new AccountInvariantViolationException("HTI-03", "Self-reference prohibited.");

        if (!parent.isSummary)
            throw new AccountInvariantViolationException("HTI-04", "Only summary accounts can have child accounts.");

        if (child.isActive && !parent.isActive)
            throw new AccountInvariantViolationException("HTI-07", "Inactive parent accounts cannot have active child accounts.");

        if (child.accountClass !== undefined && child.accountClass !== parent.accountClass)
            throw new AccountInvariantViolationException("COA-01", "Account class must match parent's account class.");

        if (!child.isContra && parent.isContra)
            throw new AccountInvariantViolationException("COA-02", "Contra account status must propagate to children.");

    }

}

type WithIndex = { localIndex?: number; }

export type CreateAccountInput =
    Omit<CreateAccountProps, 'chartId' | 'structuralCode' | 'isContra' | 'isActive' | 'accountClass'>
    & Partial<Pick<AccountProps, 'isContra' | 'isActive' | 'accountClass'>>;
export type CreateRootAccountInput = Omit<CreateRootAccountProps, 'chartId' | 'structuralCode'> & WithIndex;
export type CreateChildAccountInput =
    Omit<CreateChildAccountProps, 'chartId' | 'structuralCode' | 'isContra' | 'isActive' | 'accountClass'>
    & Partial<Pick<AccountProps, 'isContra' | 'isActive' | 'accountClass'>>
    & WithIndex;

export type UpdateAccountInput = Omit<AccountProps, 'id' | 'structuralCode'> & WithIndex;