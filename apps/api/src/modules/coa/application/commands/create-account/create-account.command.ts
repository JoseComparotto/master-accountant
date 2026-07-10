import { CreateAccountInputDto } from "../../../presentation/http/dtos/accounts.dto";
import { IAccountCommand } from "../../bases/account-command-handler.base";

export class CreateAccountCommand implements IAccountCommand {
    constructor(
        public readonly data: CreateAccountInputDto
    ) { }
}