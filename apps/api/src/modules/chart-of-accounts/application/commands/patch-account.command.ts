import { ICommand } from "@nestjs/cqrs";
import { AccountPatchDto } from '../types/accounts.types';

export class PatchAccountCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly data: AccountPatchDto
    ) {}
}