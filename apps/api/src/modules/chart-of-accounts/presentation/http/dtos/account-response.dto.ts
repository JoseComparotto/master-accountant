import { AccountClassEnum, BalanceTypeEnum } from '@repo/core';
import { AccountFlatDto } from '../../../application/types/accounts.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AccountResponseDto implements AccountFlatDto {

    @ApiProperty({
        description: 'UUID da conta',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id!: string;

    @ApiProperty({
        description: 'Nome da conta',
        example: 'Ativo Circulante'
    })
    name!: string;

    @ApiProperty({
        description: 'Descrição da conta',
        example: 'Bens e direitos com expctativa de liquidação dentro do exercício corrente.'
    })
    description!: string | null;

    @ApiPropertyOptional({
        description: 'UUID da conta superior',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    parentId?: string | null;

    @ApiProperty({
        description: 'Código da conta no nível atual (sem considerar os níveis superiores)',
        example: 1
    })
    localIndex!: number;

    @ApiProperty({
        description: 'Cocigo completo formatado da conta ',
        example: '1.1'
    })
    formattedCode!: string;

    @ApiProperty({
        description: 'Classe da conta',
        example: AccountClassEnum.ASSET,
        enumName: 'AccountClassEnum',
        enum: AccountClassEnum
    })
    accountClass!: AccountClassEnum;

    @ApiProperty({
        description: 'Saldo natural da conta',
        example: BalanceTypeEnum.DEBIT,
        enumName: 'BalanceTypeEnum',
        enum: BalanceTypeEnum
    })
    balanceType!: BalanceTypeEnum;
    
    @ApiProperty({
        description: 'Indica se a conta é sintética. Apenas contas sintéticas podem ter contas filhas.',
        example: true,
    })
    isSummary!: boolean;

    
    @ApiProperty({
        description: 'Indica se a conta é redutora. Contas redutoras tem natureza de saldo oposta ao da sua classe.',
        example: false,
    })
    isContra!: boolean;

    
    @ApiProperty({
        description: 'Indica se a conta está ativa.',
        example: true,
    })
    isActive!: boolean;

}