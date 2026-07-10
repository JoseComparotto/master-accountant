import { AccountClassEnum } from "@repo/coa-core";

export interface ChartOfAccountsDto {
    accounts: AccountDto[];
    version: number;
}

export interface AccountDto {
    id: string;
    name: string;
    description: string | null;
    localIndex: number;
    formattedCode: string;
    parentId: string | null;
    accountClass: AccountClassEnum,
    isSummary: boolean;
    isContra: boolean;
    isActive: boolean;
}

export type ReplaceAccountInputDto =
    Omit<AccountDto, 'formattedCode'>;

export type CreateAccountInputDto =
    Pick<ReplaceAccountInputDto, 'name'> &
    Partial<Omit<ReplaceAccountInputDto, 'name'>>;

export type PatchAccountInputDto =
    Partial<Pick<AccountDto, 'name' | 'description' | 'isContra' | 'isActive'>>;


export interface CreateAccountOperation {
    op: 'add',
    path: `/accounts/${string}`,
    value: CreateAccountInputDto
}

export interface ReplaceAccountAttrOperation<Attr extends keyof PatchAccountInputDto> {
    op: 'replace',
    path: `/accounts/${string}/${Attr}`,
    value: PatchAccountInputDto[Attr]
}

export type CoaPatchOperation =
    CreateAccountOperation |
    ReplaceAccountAttrOperation<keyof PatchAccountInputDto>;