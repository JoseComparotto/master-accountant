import { AccountDto } from "@repo/coa-contracts";
import { AccountEntity, ChartOfAccountsEntity } from "@repo/coa-core";

export class AccountMapper {
    static toDto(account: Readonly<AccountEntity>, chart: ChartOfAccountsEntity): AccountDto {
        return {
            id: account.id.value,
            name: account.name.value,
            description: account.description,
            parentId: account.parentId?.value ?? null,
            accountClass: account.accountClass,
            localIndex: account.localIndex,
            codeDepth: account.structuralCode.depth,
            formattedCode: account.structuralCode.value,
            balanceType: account.balanceType,
            isSummary: account.isSummary,
            isContra: account.isContra,
            isActive: account.isActive,
            capabilities:{
                canActivate: chart.canActivate(account.id),
                canInactivate: chart.canInactivate(account.id)
            }
        };
    }
}