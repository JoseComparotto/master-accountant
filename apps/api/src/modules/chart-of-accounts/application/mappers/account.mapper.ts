import { AccountEntity } from "@repo/core";
import { AccountFlatDto } from "../types/accounts.types";

export class AccountMapper {
    static toFlatDto(account: AccountEntity): AccountFlatDto {
        return {
            id: account.id.value,
            name: account.name.value,
            description: account.description,
            parentId: account.parentId?.value,
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