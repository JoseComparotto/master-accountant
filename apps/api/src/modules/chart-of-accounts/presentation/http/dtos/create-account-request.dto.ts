import { AccountClassEnum } from '@repo/core';
import { AccountCreateDto } from '../../../application/types/accounts.types';

// TODO: Aplicar decoradores do swagger
// TODO: Implementar class-validator
export class CreateAccountRequestDto implements AccountCreateDto {

    id?: string | undefined;
    parentId?: string | undefined;
    accountClass?: AccountClassEnum | undefined;
    localIndex!: number;
    name!: string;
    description?: string | undefined;
    isSummary!: boolean;
    isContra?: boolean | undefined;
    isActive?: boolean | undefined;

}