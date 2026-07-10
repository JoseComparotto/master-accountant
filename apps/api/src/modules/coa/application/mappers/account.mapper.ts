import { AccountEntity, ChartOfAccountsEntity } from "@repo/coa-core";
import { AccountDto } from "../../presentation/http/dtos/accounts.dto";

export class AccountMapper {
    static toDto(account: Readonly<AccountEntity>): AccountDto {
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
        };
    }
}