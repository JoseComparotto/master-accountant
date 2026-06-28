import { DomainEvent } from "@repo/shared-core";
import { AccountProps } from "../entities/account.entity.js";

export abstract class ChartOfAccountsEvent extends DomainEvent {
    constructor() { super(); }
}

export class ChartOfAccountsCreatedEvent extends ChartOfAccountsEvent {
}

export abstract class AccountEvent extends ChartOfAccountsEvent {
    constructor(
        public readonly accountId: string
    ) { super(); }
}

export class AccountCreatedEvent extends AccountEvent {
    constructor(
        public readonly accountProps: Readonly<AccountProps>
    ) { super(accountProps.id.value); }
}

export abstract class AccountUpdatedEvent<TAttr extends keyof AccountProps> extends AccountEvent {
    constructor(
        accountId: string,
        public readonly attribute: TAttr,
        public readonly oldValue: AccountProps[TAttr],
        public readonly newValue: AccountProps[TAttr],
    ) {
        super(accountId);
    }
}

export class AccountNameUpdated extends AccountUpdatedEvent<'name'> {
    constructor(
        accountId: string,
        oldValue: AccountProps['name'],
        newValue: AccountProps['name'],
    ) {
        super(accountId, 'name', oldValue, newValue);
    }
}

export class AccountDescriptionUpdated extends AccountUpdatedEvent<'description'> {
    constructor(
        accountId: string,
        oldValue: AccountProps['description'],
        newValue: AccountProps['description'],
    ) {
        super(accountId, 'description', oldValue, newValue);
    }
}

export abstract class AccountIsActiveUpdated extends AccountUpdatedEvent<'isActive'> {
    constructor(
        accountId: string,
        oldValue: AccountProps['isActive'],
        newValue: AccountProps['isActive'],
    ) {
        super(accountId, 'isActive', oldValue, newValue);
    }
}
export class AccountInactivated extends AccountIsActiveUpdated {
    constructor(accountId: string) {
        super(accountId, true, false);
    }
}
export class AccountActivated extends AccountIsActiveUpdated {
    constructor(accountId: string) {
        super(accountId, false, true);
    }
}

export abstract class AccountIsContraUpdated extends AccountUpdatedEvent<'isContra'> {
    constructor(
        accountId: string,
        oldValue: AccountProps['isContra'],
        newValue: AccountProps['isContra'],
    ) {
        super(accountId, 'isContra', oldValue, newValue);
    }
}
export class AccountConvertedToContra extends AccountIsContraUpdated {
    constructor(accountId: string) {
        super(accountId, false, true);
    }
}
export class AccountConvertedToNormal extends AccountIsContraUpdated {
    constructor(accountId: string) {
        super(accountId, true, false);
    }
}

export type AccountIsActiveUpdatedEvents = 
    AccountActivated |
    AccountInactivated    
;
export type AccountIsContraUpdatedEvents = 
    AccountConvertedToContra |
    AccountConvertedToNormal    
;

export type AccountUpdatedEvents =
    AccountNameUpdated |
    AccountDescriptionUpdated |
    AccountIsActiveUpdatedEvents |
    AccountIsContraUpdatedEvents
;
export type AccountsEvents =
    AccountCreatedEvent |
    AccountUpdatedEvents
;
export type ChartOfAccountsEvents = 
    ChartOfAccountsCreatedEvent |
    AccountsEvents
;