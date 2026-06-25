import { CreateAccountInputDto } from "@repo/coa-contracts";
import { IAccountCommand } from "../../bases/account-command-handler.base";

export class CreateAccountCommand implements IAccountCommand {
    constructor(
        public readonly data: CreateAccountInputDto
    ) { }
}