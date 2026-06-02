import { ICommand } from "@nestjs/cqrs";
import { AccountCreateDto } from '../types/accounts.types';

export class CreateAccountCommand implements ICommand {
    constructor(public readonly data: AccountCreateDto) {}
}