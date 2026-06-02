import { ICommand } from "@nestjs/cqrs";

// TODO: Implementar InactivateAccountCommandHandler 
export class InactivateAccountCommand implements ICommand {
    constructor(public readonly id: string) {}
}