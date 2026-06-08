import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountMapper } from "../mappers/account.mapper";
import { GetAccountByIdQuery } from "../queries/get-account-by-id.query";
import { BaseAccountRepository, UuidValue, Ensure } from "@repo/core";
import { AccountDto } from "@repo/contracts";


@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler implements IQueryHandler<GetAccountByIdQuery> {
    constructor(
        private readonly accountRepository: BaseAccountRepository,
    ) { }

    async execute(query: GetAccountByIdQuery): Promise<AccountDto> {
        const id =  Ensure.vo('id', () => UuidValue.create(query.id));

        const account = await this.accountRepository.getById(id);
        return AccountMapper.toDto(account);
    }

}