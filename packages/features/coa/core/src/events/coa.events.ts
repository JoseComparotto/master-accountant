import { DomainEvent, UuidValue } from "@repo/shared-core";
import { AccountProps } from "../entities/account.entity.js";

export abstract class ChartOfAccountsEvent implements DomainEvent {
    constructor(
        readonly occurredOn: Date = new Date()
    ) { }
}

export class ChartOfAccountsCreatedEvent extends ChartOfAccountsEvent {
}

export abstract class AccountEvent extends ChartOfAccountsEvent {
    constructor(
        public readonly accountId: UuidValue
    ) { super(); }
}

export class AccountCreatedEvent extends AccountEvent {
    constructor(
        public readonly accountProps: Readonly<AccountProps>
    ) { super(accountProps.id); }
}

export abstract class AccountUpdatedEvent<TAttr extends keyof AccountProps> extends AccountEvent {
    constructor(
        accountId: UuidValue,
        public readonly attribute: TAttr,
        public readonly oldValue: AccountProps[TAttr],
        public readonly newValue: AccountProps[TAttr],
    ) {
        super(accountId);
    }
}

export class AccountNameUpdated extends AccountUpdatedEvent<'name'> {
    constructor(
        accountId: UuidValue,
        oldValue: AccountProps['name'],
        newValue: AccountProps['name'],
    ) {
        super(accountId, 'name', oldValue, newValue);
    }
}

export class AccountDescriptionUpdated extends AccountUpdatedEvent<'description'> {
    constructor(
        accountId: UuidValue,
        oldValue: AccountProps['description'],
        newValue: AccountProps['description'],
    ) {
        super(accountId, 'description', oldValue, newValue);
    }
}

export abstract class AccountIsActiveUpdated extends AccountUpdatedEvent<'isActive'> {
    constructor(
        accountId: UuidValue,
        oldValue: AccountProps['isActive'],
        newValue: AccountProps['isActive'],
    ) {
        super(accountId, 'isActive', oldValue, newValue);
    }
}
export class AccountInactivated extends AccountIsActiveUpdated {
    constructor(accountId: UuidValue) {
        super(accountId, true, false);
    }
}
export class AccountActivated extends AccountIsActiveUpdated {
    constructor(accountId: UuidValue) {
        super(accountId, false, true);
    }
}

export abstract class AccountIsContraUpdated extends AccountUpdatedEvent<'isContra'> {
    constructor(
        accountId: UuidValue,
        oldValue: AccountProps['isContra'],
        newValue: AccountProps['isContra'],
    ) {
        super(accountId, 'isContra', oldValue, newValue);
    }
}
export class AccountConvertedToContra extends AccountIsContraUpdated {
    constructor(accountId: UuidValue) {
        super(accountId, false, true);
    }
}
export class AccountConvertedToNormal extends AccountIsContraUpdated {
    constructor(accountId: UuidValue) {
        super(accountId, true, false);
    }
}

