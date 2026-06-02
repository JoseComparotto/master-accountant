import { AccountProps, CreateAccountProps } from "@repo/core";

export type AccountFlatDto = Omit<AccountProps, 'parent'> & {
    parentId?: string;
};

export type AccountCreateDto = Omit<CreateAccountProps, 'parent'> & {
    parentId?: string;
};