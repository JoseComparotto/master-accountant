import { AccountDto } from "@repo/coa-contracts";
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

}