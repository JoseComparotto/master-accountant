import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccountClassEnum, BalanceTypeEnum, canActivateAccount, canInactivateAccount } from "@repo/coa-core";
import { UuidValue } from "@repo/shared-core";
import { AppConfig } from "../../../../config/configuration";
import { InMemoryChartOfAccountsFillerService } from "./services/in-memory-account-filler.service";
import { AccountsCapabilitiesDto } from "@repo/coa-contracts";

export interface ChartStorageSnapshot {
    chartId: string;
    version: number;
}

export interface AccountStorageSnapshot {
    chartId: string;
    id: string;
    structuralCode: number[];
    parentId: string | null;
    name: string;
    description: string | null;
    accountClass: `${AccountClassEnum}`;
    balanceType: `${BalanceTypeEnum}`;
    isSummary: boolean;
    isContra: boolean;
    isActive: boolean;
}

@Injectable()
export class InMemoryChartOfAccountsDatabase {
    public readonly chartsById: Map<UuidValue['value'], ChartStorageSnapshot> = new Map();
    public readonly accountsById: Map<UuidValue['value'], AccountStorageSnapshot> = new Map();

    public get accounts(): readonly AccountStorageSnapshot[] {
        return [...this.accountsById.values()];
    }

    constructor(
        configService: ConfigService<AppConfig>,
        filler: InMemoryChartOfAccountsFillerService
    ) {
        const config = configService.getOrThrow("mock", { infer: true });

        filler.fill(this, config);
    }

    withCapabilities(account: AccountStorageSnapshot): AccountStorageSnapshot & { capabilities: AccountsCapabilitiesDto } {

        const parent = account.parentId ? this.accountsById.get(account.parentId) : null;
        const hasAnyActiveChild = this.accounts.some(a=>a.parentId===account.id && a.isActive);

        return {
            ...account,
            capabilities: {
                canActivate: canActivateAccount({
                    isAlreadyActive: account.isActive,
                    isParentInactive: !!parent && !parent.isActive
                }).can,
                canInactivate: canInactivateAccount({
                    isAlreadyInactive: !account.isActive,
                    hasAnyActiveChild
                }).can
            }
        }
    }

}
