import { ICommand } from "@nestjs/cqrs";

export class ActivateAccountCommand implements ICommand {

    constructor(public readonly id: string) {}

}