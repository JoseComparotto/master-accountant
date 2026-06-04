import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllAccountsQuery } from "../queries/get-all-accounts.query";
import { AccountEntity, type IAccountRepository } from "@repo/core";
import { Inject } from "@nestjs/common";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { AccountAppService } from "../services/account-app.service";

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler implements IQueryHandler<GetAllAccountsQuery> {
    constructor(
        private readonly accountAppService: AccountAppService,
    ) { }

    async execute(query: GetAllAccountsQuery): Promise<AccountFlatDto[]> {
        const accounts = await this.accountAppService.getAll();

        accounts.sort(AccountEntity.sortByCode);

        return accounts.map(AccountMapper.toFlatDto);
    }

}