import { PatchAccountInputDto } from "../../../presentation/http/dtos/accounts.dto";
import { IAccountCommand } from "../../bases/account-command-handler.base";

export class PatchAccountCommand implements IAccountCommand {
    constructor(
        public readonly accountId: string,
        public readonly data: PatchAccountInputDto
    ) { }
}