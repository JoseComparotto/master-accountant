import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllAccountsQuery } from "../queries/get-all-accounts.query";
import { AccountEntity, type IAccountRepository } from "@repo/core";
import { Inject } from "@nestjs/common";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";

// TODO: Talvez fazer um AccountAppService

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler implements IQueryHandler<GetAllAccountsQuery> {
    constructor(
        @Inject('IAccountRepository')
        private readonly accountRepository: IAccountRepository,
    ) { }

    async execute(query: GetAllAccountsQuery): Promise<AccountFlatDto[]> {
        const accounts = await this.accountRepository.findAll();

        accounts.sort(AccountEntity.sortByCode);

        return accounts.sort().map(AccountMapper.toFlatDto);
    }

}