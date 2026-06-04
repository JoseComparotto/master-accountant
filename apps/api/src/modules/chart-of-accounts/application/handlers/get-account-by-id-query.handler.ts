import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { GetAccountByIdQuery } from "../queries/get-account-by-id.query";

import { AccountAppService } from "../services/account-app.service";

@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler implements IQueryHandler<GetAccountByIdQuery> {
    constructor(
        private readonly accountAppService: AccountAppService,
    ) { }

    async execute({ id }: GetAccountByIdQuery): Promise<AccountFlatDto> {
        const account = await this.accountAppService.getById(id);
        return AccountMapper.toFlatDto(account);
    }

}