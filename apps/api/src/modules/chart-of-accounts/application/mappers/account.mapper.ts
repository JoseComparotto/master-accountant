import { AccountEntity } from "@repo/core";
import { AccountFlatDto } from "../types/accounts.types";

export class AccountMapper {
    static toFlatDto(account: AccountEntity): AccountFlatDto {
        return {
            id: account.id,
            name: account.name,
            description: account.description,
            parentId: account.parent?.id,
            accountClass: account.accountClass,
            localIndex: account.localIndex,
            formattedCode: account.structuralCode.toString(),
            balanceType: account.balanceType,
            isSummary: account.isSummary,
            isContra: account.isContra,
            isActive: account.isActive,
        };
    }
}