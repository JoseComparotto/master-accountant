import { Inject, Injectable } from "@nestjs/common";
import type { AccountEntity, IAccountRepository } from "@repo/core";
import { AccountNotFoundException } from "../exceptions/account-not-found.exception";

@Injectable()
export class AccountAppService {
    constructor(
        @Inject('IAccountRepository')
        private readonly repository: IAccountRepository
    ) {}

    async getAll(): Promise<AccountEntity[]>  {
        return await this.repository.findAll();
    }

    async getById(id: string): Promise<AccountEntity> {
        const account = await this.repository.findById(id);
        if (!account) {
            throw new AccountNotFoundException(id);
        }
        return account;
    }
}