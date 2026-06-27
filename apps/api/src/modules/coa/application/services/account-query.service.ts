import { AccountDto, AccountNodeDto, ChartOfAccountsDto } from "@repo/coa-contracts";
import { UuidValue } from "@repo/shared-core";
import { IAccountQueryService } from "../interfaces/account-query-service.interface";
import { Inject, Injectable } from "@nestjs/common";
import type { IChartOfAccountsRepository } from "@repo/coa-core";
import { AccountMapper } from "../mappers/account.mapper";
import { firstValueFrom } from "rxjs";
import { ChartOfAccountsMapper } from "../mappers/coa.mapper";

@Injectable()
export class AccountQueryService implements IAccountQueryService {

    constructor(
        @Inject('IChartOfAccountsRepository')
        private readonly repo: IChartOfAccountsRepository
    ) { }

    async getChart(): Promise<ChartOfAccountsDto> {
        const chart = await firstValueFrom(this.repo.getUnique());
        return ChartOfAccountsMapper.toDto(chart);
    }

    async getAllAccounts(): Promise<AccountDto[]> {
        const chart = await firstValueFrom(this.repo.getUnique());
        return chart.accounts.map(a => AccountMapper.toDto(a, chart));
    }

    async getAccountsTree(): Promise<AccountNodeDto[]> {
        const chart = await firstValueFrom(this.repo.getUnique());

        const roots: AccountNodeDto[] = []
        const mapping: Map<string, AccountNodeDto> = new Map();

        const { accounts } = chart;

        for (const account of accounts) {
            const dto = AccountMapper.toDto(account, chart);
            mapping.set(dto.id, dto);
        }

        for (const dto of mapping.values()) {
            if (dto.parentId) {
                const parent = mapping.get(dto.parentId)!;
                parent.children ??= [];
                parent.children.push(dto);
            } else {
                roots.push(dto);
            }
        }
        return roots;
    }

    async getAccountById(accountId: UuidValue): Promise<AccountDto> {
        const chart = await firstValueFrom(this.repo.getUnique());
        const account = chart.getAccountById(accountId);
        return AccountMapper.toDto(account, chart);
    }

}