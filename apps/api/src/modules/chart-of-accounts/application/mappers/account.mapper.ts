import { AccountDto } from "@repo/contracts";
import { AccountEntity } from "@repo/core";

export class AccountMapper {
    static toFlatDto(account: AccountEntity): AccountDto {
        return {
            id: account.id.value,
            name: account.name.value,
            description: account.description,
            parentId: account.parentId?.value ?? null,
            accountClass: account.accountClass,
            localIndex: account.localIndex,
            formattedCode: account.structuralCode.value,
            balanceType: account.balanceType,
            isSummary: account.isSummary,
            isContra: account.isContra,
            isActive: account.isActive,
        };
    }
}