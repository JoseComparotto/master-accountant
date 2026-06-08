import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllAccountsQuery } from "../queries/get-all-accounts.query";
import { AccountEntity, BaseAccountRepository } from "@repo/core";
import { AccountMapper } from "../mappers/account.mapper";
import { AccountDto } from "@repo/contracts";

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler implements IQueryHandler<GetAllAccountsQuery> {
    constructor(
        private readonly accountRepository: BaseAccountRepository,
    ) { }

    async execute(query: GetAllAccountsQuery): Promise<AccountDto[]> {
        const accounts = await this.accountRepository.findAll();

        accounts.sort(AccountEntity.sortByCode);

        return accounts.map(AccountMapper.toFlatDto);
    }

}