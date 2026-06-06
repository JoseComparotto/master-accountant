import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllAccountsQuery } from "../queries/get-all-accounts.query";
import { AccountEntity, BaseAccountRepository } from "@repo/core";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler implements IQueryHandler<GetAllAccountsQuery> {
    constructor(
        private readonly accountRepository: BaseAccountRepository,
    ) { }

    async execute(query: GetAllAccountsQuery): Promise<AccountFlatDto[]> {
        const accounts = await this.accountRepository.findAll();

        accounts.sort(AccountEntity.sortByCode);

        return accounts.map(AccountMapper.toFlatDto);
    }

}