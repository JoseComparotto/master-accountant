import { AccountProps, CreateAccountProps } from "@repo/core";

export type AccountFlatDto = Omit<AccountProps, 'parent' | 'structuralCode'> & {
    parentId?: string;
    formattedCode: string;
};

export type AccountCreateDto = Omit<CreateAccountProps, 'parent'> & {
    parentId?: string;
};