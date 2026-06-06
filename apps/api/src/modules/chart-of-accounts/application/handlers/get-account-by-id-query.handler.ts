import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { GetAccountByIdQuery } from "../queries/get-account-by-id.query";
import { AccountRepository, UuidValue, Ensure } from "@repo/core";


@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler implements IQueryHandler<GetAccountByIdQuery> {
    constructor(
        private readonly accountRepository: AccountRepository,
    ) { }

    async execute(query: GetAccountByIdQuery): Promise<AccountFlatDto> {
        const id =  Ensure.vo('id', () => UuidValue.create(query.id));

        const account = await this.accountRepository.getById(id);
        return AccountMapper.toFlatDto(account);
    }

}