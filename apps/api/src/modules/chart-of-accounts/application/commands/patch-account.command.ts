import { ICommand } from "@nestjs/cqrs";
import { PatchAccountInputDto } from "@repo/contracts";
import { BaseAccountCommand } from "../bases/account-command-handler.base";

export class PatchAccountCommand extends BaseAccountCommand{
    constructor(
        public readonly chartId: string,
        public readonly accountId: string,
        public readonly data: PatchAccountInputDto
    ) {
        super(chartId);
    }
}