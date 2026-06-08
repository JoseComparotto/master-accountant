import { ICommand } from "@nestjs/cqrs";
import { PatchAccountInputDto } from "@repo/contracts";

export class PatchAccountCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly data: PatchAccountInputDto
    ) {}
}