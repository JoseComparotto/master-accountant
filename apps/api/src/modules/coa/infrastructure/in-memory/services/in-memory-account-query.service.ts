import { AccountDto, AccountNodeDto } from "@repo/coa-contracts";
import { UuidValue } from "@repo/shared-core";
import { IAccountQueryService } from "../../../application/interfaces/account-query-service.interface";
import { InMemoryChartOfAccountsDatabase } from "../in-memory.database";
import { AccountStorageMapper } from "../mappers/account-storage.mapper";
import { AccountNotExistsWithIdException, StructuralCodeValue } from "@repo/coa-core";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InMemoryAccountQueryService implements IAccountQueryService {

    constructor(
        private readonly db: InMemoryChartOfAccountsDatabase
    ) { }

    async findAccountById(chartId: UuidValue, accountId: UuidValue): Promise<AccountDto | null> {
        const snapshot = this.db.accountsById.get(accountId.value);
        if (!snapshot || !UuidValue.isEquals(snapshot.chartId, chartId))
            return null;
        return AccountStorageMapper.toDto(snapshot);
    }

    async getAccountById(chartId: UuidValue, accountId: UuidValue): Promise<AccountDto> {
        const account = await this.findAccountById(chartId, accountId);
        if (!account) throw new AccountNotExistsWithIdException(accountId.value);
        return account;
    }

    async getAllAccountsByChartId(chartId: UuidValue): Promise<AccountDto[]> {
        return this.db.accounts.filter(a => UuidValue.isEquals(a.chartId, chartId))
            .sort((a, b) => {
                const codeA = StructuralCodeValue.fromSegments(a.structuralCode);
                const codeB = StructuralCodeValue.fromSegments(b.structuralCode);
                return codeA.compareTo(codeB);
            })
            .map(AccountStorageMapper.toDto);
    }


    async getAccountsTreeByChartId(chartId: UuidValue): Promise<AccountNodeDto[]> {
        const flatList: AccountNodeDto[] = this.db.accounts
            .filter(a => UuidValue.isEquals(a.chartId, chartId))
            .map(AccountStorageMapper.toDto)
            .map(account => ({
                ...account,
                children: account.isSummary ? [] : undefined
            }));

        if (flatList.length === 0) return [];

        const roots: AccountNodeDto[] = [];
        const mapping: Map<string, AccountNodeDto> = new Map();

        for (const account of flatList) {
            mapping.set(account.id, account);
        }

        for (const account of flatList) {
            if (account.parentId === null)
                roots.push(account)
            else {
                const parent = mapping.get(account.parentId)!;
                const siblings = parent.children ?? []; 
                siblings.push(account);
                parent.children = siblings;
            }
        }

        return roots;
    }


}