import { PatchAccountInputDto } from "@repo/coa-contracts";
import { IAccountCommand } from "../../bases/account-command-handler.base";

export class PatchAccountCommand implements IAccountCommand {
    constructor(
        public readonly accountId: string,
        public readonly data: PatchAccountInputDto
    ) { }
}