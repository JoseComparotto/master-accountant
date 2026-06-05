import { AccountProps, CreateAccountProps, BalanceTypeEnum, AccountMetadataPatch } from "@repo/core";

export type AccountFlatDto = Omit<AccountProps, 'id' | 'parent' | 'structuralCode'> & {
    id: string,
    parentId?: string | null;
    formattedCode: string;
    balanceType: BalanceTypeEnum
};

export type AccountCreateDto = Omit<CreateAccountProps, 'id' | 'parent' | 'localIndex'> & {
    id?: string | null,
    parentId?: string | null;
    localIndex?: number | null
};

export type AccountPatchDto = AccountMetadataPatch &
    Partial<Pick<AccountProps, 'isContra' | 'isActive'>>