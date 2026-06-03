import { AccountProps, CreateAccountProps } from "@repo/core";

export type AccountFlatDto = Omit<AccountProps, 'parent' | 'structuralCode'> & {
    parentId?: string | null;
    formattedCode: string;
};

export type AccountCreateDto = Omit<CreateAccountProps, 'parent' | 'localIndex'> & {
    parentId?: string | null;
    localIndex?: number | null
};