import { AccountClassEnum } from '@repo/core';
import { AccountFlatDto } from '../../../application/types/accounts.types';

export class AccountResponseDto implements AccountFlatDto {

    id!: string;
    name!: string;
    description?: string | undefined;
    parentId?: string | undefined;
    localIndex!: number;
    accountClass!: AccountClassEnum;
    isSummary!: boolean;
    isContra!: boolean;
    isActive!: boolean;

}