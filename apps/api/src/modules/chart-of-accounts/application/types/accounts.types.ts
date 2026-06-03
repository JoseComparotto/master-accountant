import { AccountProps, CreateAccountProps, BalanceTypeEnum, AccountMetadataPatch } from "@repo/core";

export type AccountFlatDto = Omit<AccountProps, 'parent' | 'structuralCode'> & {
    parentId?: string | null;
    formattedCode: string;
    balanceType: BalanceTypeEnum
};

export type AccountCreateDto = Omit<CreateAccountProps, 'parent' | 'localIndex'> & {
    parentId?: string | null;
    localIndex?: number | null
};

export type AccountPatchDto = AccountMetadataPatch &
    Partial<Pick<AccountProps, 'isContra'>>