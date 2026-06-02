import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import type { IAccountRepository } from "@repo/core";
import { Inject } from "@nestjs/common";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { GetAccountByIdQuery } from "../queries/get-account-by-id.query";

import { AccountNotFoundException } from "../exceptions/account-not-found.exception";

@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler implements IQueryHandler<GetAccountByIdQuery> {
    constructor(
        @Inject('IAccountRepository')
        private readonly accountRepository: IAccountRepository,
    ) { }

    async execute({ id }: GetAccountByIdQuery): Promise<AccountFlatDto> {
        const account = await this.accountRepository.findById(id);

        if (!account) {
            throw new AccountNotFoundException(id);
        }

        return AccountMapper.toFlatDto(account);
    }

}