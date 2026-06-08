import { AccountClassEnum } from '@repo/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAccountInputDto } from '@repo/contracts';

export class CreateAccountRequestDto implements CreateAccountInputDto {

    @ApiPropertyOptional({
        description: 'UUID gerado pelo cliente para garantia de idempotência. Se não fornecido, o sistema irá gerar um novo UUID v4.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id?: string | undefined;

    @ApiPropertyOptional({
        description: 'UUID do pai do conta. Se não fornecido, a conta será criada como raiz.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    parentId?: string | undefined;

    @ApiPropertyOptional({
        description: 'Classe da conta. Obrigatório apenas para contas raiz. Para contas filhas, a classe é herdada do pai e este campo deve ser omitido, nulo ou igual à do pai.',
        example: AccountClassEnum.ASSET,
        enumName: 'AccountClassEnum',
        enum: AccountClassEnum
    })
    accountClass?: AccountClassEnum | undefined;

    @ApiPropertyOptional({
        description: 'Código da conta no nível atual (sem considerar os níveis superiores)',
        example: 1
    })
    localIndex?: number;

    @ApiProperty({
        description: 'Nome da conta. Deve ser único e descritivo.',
        example: 'Ativo Circulante'
    })
    name!: string;

    @ApiPropertyOptional({
        description: 'Descrição opcional da conta para fornecer informações adicionais.',
        example: 'Bens e direitos com expctativa de liquidação dentro do exercício corrente.'
    })
    description?: string;

    @ApiProperty({
        description: 'Indica se a conta é sintética. Apenas contas sintéticas podem ter contas filhas.',
        example: true,
    })
    isSummary!: boolean;

    @ApiPropertyOptional({
        description: 'Indica se a conta é redutora. Contas redutoras tem natureza de saldo oposta ao da sua classe.',
        example: false,
        default: false
    })
    isContra?: boolean | undefined;

    @ApiPropertyOptional({
        description: 'Indica se a conta está ativa.',
        example: true,
        default: true
    })
    isActive?: boolean | undefined;

}