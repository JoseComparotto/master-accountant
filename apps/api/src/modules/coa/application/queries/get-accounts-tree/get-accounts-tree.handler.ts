import { QueryHandler } from "@nestjs/cqrs";
import { BaseGetAccountsTreeQueryHandler, GetAccountsTreeQuery } from "./get-accounts-tree.query";
import { AccountNodeDto } from "../../../presentation/http/dtos/accounts.dto";

@QueryHandler(GetAccountsTreeQuery)
export class GetAccountsTreeQueryHandler extends BaseGetAccountsTreeQueryHandler {
    async execute(query: GetAccountsTreeQuery): Promise<AccountNodeDto[]> {
        return await this.service.getAccountsTree();
    }

}