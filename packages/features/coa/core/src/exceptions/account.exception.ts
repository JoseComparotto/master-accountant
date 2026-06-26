import { StructuralCodeValue } from "../value-objects/structural-code.value.js";
import {
    DomainInvariantViolationException,
    DuplicatedEntityIdException,
    DuplicatedUniqueAttributeException,
    EntityNotExistsWithIdException,
    EntityNotExistsWithUniqueAttributeException
} from "@repo/shared-core";

const ENTITY_NAME = 'Account';

export class DuplicatedAccountIdException extends DuplicatedEntityIdException {
    constructor(accountId: string) {
        super(ENTITY_NAME, accountId)
    }
}

export class DuplicatedAccountCodeException extends DuplicatedUniqueAttributeException<StructuralCodeValue> {
    constructor(structuralCode: StructuralCodeValue) {
        super(ENTITY_NAME, 'structuralCode', structuralCode)
    }
}

export class ChartOfAccountsNotExistsWithIdException extends EntityNotExistsWithIdException {
    constructor(chartId: string) {
        super('ChartOfAccounts', chartId)
    }
}

export class AccountNotExistsWithIdException extends EntityNotExistsWithIdException {
    constructor(accountId: string) {
        super(ENTITY_NAME, accountId)
    }
}

export class AccountNotExistsWithCodeException extends EntityNotExistsWithUniqueAttributeException<string> {
    constructor(structuralCode: string) {
        super(ENTITY_NAME, 'structuralCode', structuralCode)
    }
}

export class AccountInvariantViolationException extends DomainInvariantViolationException {
    constructor(
        ruleId: string,
        message: string,
    ) {
        super(ruleId, message, ENTITY_NAME)
    }
}