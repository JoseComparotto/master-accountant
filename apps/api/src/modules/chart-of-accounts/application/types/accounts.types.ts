import { AccountProps, CreateAccountProps, BalanceTypeEnum, AccountMetadataPatch } from "@repo/core";

export type AccountFlatDto = Omit<AccountProps, 'id' | 'name' | 'parent' | 'structuralCode'> & {
    id: string,
    name: string,
    parentId?: string | null;
    formattedCode: string;
    balanceType: BalanceTypeEnum
};

export type AccountCreateDto = Omit<CreateAccountProps, 'id' | 'name' | 'parent' | 'localIndex'> & {
    id?: string | null,
    name: string,
    parentId?: string | null;
    localIndex?: number | null
};

export type AccountPatchDto = {
    name?: string
} & Partial<Pick<AccountProps, 'description'>>
    & Partial<Pick<AccountProps, 'isContra' | 'isActive'>>