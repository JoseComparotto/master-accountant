import { AccountClassEnum } from '@repo/core';
import { AccountCreateDto } from '../../../application/types/accounts.types';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountRequestDto implements AccountCreateDto {

    @IsUUID('4', { message: 'Se fornecido, o ID deve ser um UUID v4 válido.' })
    @IsOptional()
    @ApiPropertyOptional({
        description: 'UUID gerado pelo cliente para garantia de idempotência. Se não fornecido, o sistema irá gerar um novo UUID v4.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id?: string | undefined;

    @IsUUID('4', { message: 'Se fornecido, o ID do pai deve ser um UUID v4 válido.' })
    @IsOptional()
    @ApiPropertyOptional({
        description: 'UUID do pai do conta. Se não fornecido, a conta será criada como raiz.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    parentId?: string | undefined;

    @IsOptional()
    @IsEnum(AccountClassEnum, { message: 'A classe da conta deve ser um valor válido do enum AccountClassEnum: "asset", "liability", "equity", "income" ou "expense"' })
    @ApiPropertyOptional({
        description: 'Classe da conta. Obrigatório apenas para contas raiz. Para contas filhas, a classe é herdada do pai e este campo deve ser omitido, nulo ou igual à do pai.',
        example: AccountClassEnum.ASSET,
        enumName: 'AccountClassEnum',
        enum: AccountClassEnum
    })
    accountClass?: AccountClassEnum | undefined;

    @IsOptional()
    @IsInt({ message: 'Se fornecido, o localIndex deve ser um número inteiro.' })
    @IsPositive({ message: 'Se fornecido, o localIndex deve ser um número positivo.' })
    @ApiPropertyOptional({
        description: 'Código da conta no nível atual (sem considerar os níveis superiores)',
        example: 1
    })
    localIndex?: number | null;

    @IsString()
    @MinLength(3, { message: 'O nome da conta deve ter no mínimo 3 caracteres.' })
    @MaxLength(100, { message: 'O nome da conta deve ter no máximo 100 caracteres.' })
    @ApiProperty({
        description: 'Nome da conta. Deve ser único e descritivo.',
        example: 'Ativo Circulante'
    })
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'A descrição da conta deve ter no máximo 1000 caracteres.' })
    @ApiPropertyOptional({
        description: 'Descrição opcional da conta para fornecer informações adicionais.',
        example: 'Bens e direitos com expctativa de liquidação dentro do exercício corrente.'
    })
    description?: string | undefined;

    @IsBoolean({ message: 'O campo isSummary deve ser um valor booleano.' })
    @ApiProperty({
        description: 'Indica se a conta é sintética. Apenas contas sintéticas podem ter contas filhas.',
        example: true,
    })
    isSummary!: boolean;

    @IsOptional()
    @IsBoolean({ message: 'O campo isContra deve ser um valor booleano.' })
    @ApiPropertyOptional({
        description: 'Indica se a conta é redutora. Contas redutoras tem natureza de saldo oposta ao da sua classe.',
        example: false,
        default: false
    })
    isContra?: boolean | undefined;

    @IsOptional()
    @IsBoolean({ message: 'Se fornecido, o campo isActive deve ser um valor booleano.' })
    @ApiPropertyOptional({
        description: 'Indica se a conta está ativa.',
        example: true,
        default: true
    })
    isActive?: boolean | undefined;

}