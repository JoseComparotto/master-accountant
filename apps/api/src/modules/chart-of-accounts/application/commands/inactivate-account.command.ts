import { ICommand } from "@nestjs/cqrs";

export class InactivateAccountCommand implements ICommand {
    constructor(public readonly id: string) {}
}