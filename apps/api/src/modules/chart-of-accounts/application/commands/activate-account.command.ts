import { ICommand } from "@nestjs/cqrs";

// TODO: Implementar InactivateAccountCommandHandler 
export class ActivateAccountCommand implements ICommand {
    constructor(public readonly id: string) {}
}