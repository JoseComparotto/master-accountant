import { AccountDto } from "@repo/coa-contracts";
import { AccountEntity, canActivateAccount, canInactivateAccount, ChartOfAccountsEntity } from "@repo/coa-core";

export class AccountMapper {
    static toDto(account: Readonly<AccountEntity>, chart: ChartOfAccountsEntity): AccountDto {

        const parent = account.parentId ? chart.getAccountById(account.parentId) : null;

        const children = chart.getAccountsByParentId(account.id);

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
                canActivate: canActivateAccount({
                    isAlreadyActive: account.isActive,
                    isParentInactive: !!parent && !parent.isActive
                }).can,
                canInactivate: canInactivateAccount({
                    isAlreadyInactive: !account.isActive,
                    hasAnyActiveChild: children.some(c=>c.isActive)
                }).can
            }
        };
    }
}