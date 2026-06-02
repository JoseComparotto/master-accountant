import { AccountClassEnum } from '@repo/core';
import { AccountFlatDto } from '../../../application/types/accounts.types';

export class AccountResponseDto implements AccountFlatDto {

    id!: string;
    name!: string;
    description!: string | null;
    parentId!: string | null;
    localIndex!: number;
    formattedCode!: string;
    accountClass!: AccountClassEnum;
    isSummary!: boolean;
    isContra!: boolean;
    isActive!: boolean;

}