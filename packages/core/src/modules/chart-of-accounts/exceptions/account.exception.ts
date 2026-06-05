import { DomainInvariantViolationException, EntityAlreadyExistsException, EntityNotExistsException } from "../../../shared/exception/domain.exception.js";

const ENTITY_NAME = 'Account';

export class AccountAlreadyExistsException extends EntityAlreadyExistsException {
    constructor(accountId: string) {
        super(ENTITY_NAME, accountId)
    }
}

export class AccountExistsException extends EntityNotExistsException {
    constructor(accountId: string) {
        super(ENTITY_NAME, accountId)
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