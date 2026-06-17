import { AccountProps, ChartOfAccountsEntity, IChartOfAccountsRepository, VersionValue } from "@repo/coa-core";
import { UuidValue } from "@repo/shared-core";
import { InMemoryChartOfAccountsDatabase } from "../in-memory.database";
import { OptimisticLockException } from "../../../../../shared/infrastructure/exceptions/infrastructure.exception";
import { AccountStorageMapper } from "../mappers/account-storage.mapper";

export class InMemoryChartOfAccountsRepository implements IChartOfAccountsRepository {

    constructor(
        private readonly db: InMemoryChartOfAccountsDatabase
    ) { }


    /**
     * Busca o agregado do banco e reconstrói o estado com base no Snapshot salvo
     */
    public async getById(id: UuidValue): Promise<ChartOfAccountsEntity> {
        const snapshot = this.db.chartsById.get(id.value);

        if (!snapshot) {
            throw new Error(`Chart of Accounts with ID "${id.value}" not found.`);
        }

        const accountsProps: AccountProps[] = this.db.accounts
            .filter(a => UuidValue.isEquals(a.chartId, id))
            .map(AccountStorageMapper.toProps);

        const version = VersionValue.create(snapshot.version);
        const chartId = UuidValue.create(snapshot.chartId);

        return ChartOfAccountsEntity.reconstitute(chartId, accountsProps, version);
    }


    public async save(chart: ChartOfAccountsEntity): Promise<void> {
        const chartIdStr = chart.id.value;
        const currentSnapshot = this.db.chartsById.get(chartIdStr);

        if (currentSnapshot && currentSnapshot.version !== chart.version.value) {
            throw new OptimisticLockException(
                chartIdStr,
                chart.version.value,
                currentSnapshot.version
            );
        }

        const versionToPersist = chart.version.next();

        const serializedAccounts = chart.accounts.map(AccountStorageMapper.toSnapshot);

        this.db.chartsById.set(chartIdStr, {
            chartId: chartIdStr,
            version: versionToPersist.value,
        });
        serializedAccounts.forEach(account => {
            this.db.accountsById.set(account.id,account)
        });
    }

}