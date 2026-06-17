import { CreateAccountInputDto } from "@repo/coa-contracts";
import { BaseAccountCommand } from "../bases/account-command-handler.base";

export class CreateAccountCommand extends BaseAccountCommand {
    constructor(
        public readonly chartId: string,
        public readonly data: CreateAccountInputDto
    ) {
        super(chartId);
    }
}