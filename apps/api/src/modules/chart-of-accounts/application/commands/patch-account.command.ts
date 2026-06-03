import { ICommand } from "@nestjs/cqrs";
import { AccountPatchDto } from '../types/accounts.types';

// TODO: Implementar PatchAccountCommandHandler 
export class PatchAccountCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly data: AccountPatchDto
    ) {}
}