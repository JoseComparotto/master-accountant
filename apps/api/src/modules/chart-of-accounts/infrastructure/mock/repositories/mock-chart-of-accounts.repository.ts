import { Injectable } from "@nestjs/common";
import {
    AccountClassEnum,
    type AccountEntity,
    AccountNameValue,
    AccountProps,
    ChartOfAccountsEntity,
    IChartOfAccountsRepository,
    StructuralCodeValue,
    UuidValue,
    VersionValue,
} from "@repo/core";
import { OptimisticLockException } from "../../../../../shared/infrastructure/exceptions/infrastructure.exception";
import { MockChartOfAccountsFiller } from "./mock-chart-of-accounts.filler";

export interface ChartStorageSnapshot {
    chartId: string;
    version: number;
    accounts: Array<AccountStorageSnapshot>;
}
export interface AccountStorageSnapshot {
    id: string;
    structuralCode: number[];
    parentId: string | null;
    name: string;
    description: string | null;
    accountClass: `${AccountClassEnum}`;
    isSummary: boolean;
    isContra: boolean;
    isActive: boolean;
}


@Injectable()
export class MockChartOfAccountsRepository implements IChartOfAccountsRepository {
    private readonly _database = new Map<string, ChartStorageSnapshot>();

    constructor(){
        MockChartOfAccountsFiller.fill(this._database);
    }

    /**
     * Busca o agregado do banco e reconstrói o estado com base no Snapshot salvo
     */
    public async getById(id: UuidValue): Promise<ChartOfAccountsEntity> {
        const snapshot = this._database.get(id.value);

        if (!snapshot) {
            throw new Error(`Chart of Accounts with ID "${id.value}" not found.`);
        }

        // 1. Mapeia as linhas primitivas do banco de volta para o formato de Props do Domínio
        const accountsProps: AccountProps[] = snapshot.accounts.map(AccountStorageMapper.toProps);

        // 2. Reconstrói os Value Objects necessários
        const version = VersionValue.create(snapshot.version);
        const chartId = UuidValue.create(snapshot.chartId);

        // 3. Devolve o Agregado totalmente operacional e reidratado
        return ChartOfAccountsEntity.reconstitute(chartId, accountsProps, version);
    }

    /**
     * Desmancha o agregado em dados primitivos e salva/atualiza no banco com Bloqueio Otimista
     */
    public async save(chart: ChartOfAccountsEntity): Promise<void> {
        const chartIdStr = chart.id.value;
        const currentSnapshot = this._database.get(chartIdStr);

        if (currentSnapshot && currentSnapshot.version !== chart.version.value) {
            throw new OptimisticLockException(
                chartIdStr,
                chart.version.value,
                currentSnapshot.version
            );
        }

        const versionToPersist = chart.version.next();

        const serializedAccounts = chart.accounts.map(AccountStorageMapper.toSnapshot);

        this._database.set(chartIdStr, {
            chartId: chartIdStr,
            version: versionToPersist.value,
            accounts: serializedAccounts
        });
    }

}

class AccountStorageMapper {
    static toProps(snapshot: AccountStorageSnapshot): AccountProps {
        return {
            id: UuidValue.create(snapshot.id),
            structuralCode: StructuralCodeValue.fromSegments(snapshot.structuralCode),
            name: AccountNameValue.create(snapshot.name),
            description: snapshot.description,
            parentId: UuidValue.createOptional(snapshot.parentId) ?? null,
            accountClass: snapshot.accountClass as AccountClassEnum,
            isSummary: snapshot.isSummary,
            isContra: snapshot.isContra,
            isActive: snapshot.isActive
        }
    }
    static toSnapshot(entity: Readonly<AccountEntity>): AccountStorageSnapshot {
        return {
            id: entity.id.value,
            structuralCode: entity.structuralCode.segments,
            name: entity.name.value,
            description: entity.description,
            parentId: entity.parentId?.value ?? null,
            accountClass: entity.accountClass,
            isSummary: entity.isSummary,
            isContra: entity.isContra,
            isActive: entity.isActive
        }

    }
}