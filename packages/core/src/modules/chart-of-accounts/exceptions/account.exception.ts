import { DomainInvariantViolationException, EntityAlreadyExistsException, EntityNotExistsException } from "../../../shared/exception/domain.exception.js";
import { UuidValue } from "../../../shared/value-objects/uuid.value.js";

const ENTITY_NAME = 'Account';

export class AccountAlreadyExistsException extends EntityAlreadyExistsException {
    constructor(accountId: UuidValue) {
        super(ENTITY_NAME, accountId)
    }
}

export class AccountExistsException extends EntityNotExistsException {
    constructor(accountId: UuidValue) {
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