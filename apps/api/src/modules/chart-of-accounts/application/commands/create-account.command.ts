import { ICommand } from "@nestjs/cqrs";
import { CreateAccountInputDto } from "@repo/contracts";

export class CreateAccountCommand implements ICommand {
    constructor(public readonly data: CreateAccountInputDto) {}
}