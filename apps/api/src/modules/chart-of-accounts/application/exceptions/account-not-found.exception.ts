import { BaseResourceNotFoundException } from "../../../../shared/application/exceptions/base-resource-not-found.exception";

// TODO: Especificar mais exceções de aplicação
export class AccountNotFoundException extends BaseResourceNotFoundException {
    constructor(accountId: string) {
        super('Account', accountId);
        this.name = 'AccountNotFoundException';
    }
}