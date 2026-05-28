import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsArray,
    ArrayMinSize,
    ArrayMaxSize,
    IsInt,
    IsOptional,
    IsUUID,
    Max,
    Min
} from 'class-validator';

export class CreateChartOfAccountsBodyDto {

    @IsOptional()
    @ApiPropertyOptional({
        description: 'UUID gerado pelo cliente para garantia de idempotência. Se não fornecido, o sistema irá gerar um novo UUID v4.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID('4', { message: 'Se fornecido, o ID deve ser um UUID v4 válido.' })
    id?: string;

    @ApiProperty({
        description: 'Nome do plano de contas. Deve ser único e descritivo.',
        example: 'Plano de Contas Principal'
    })
    @IsString({ message: 'O nome do plano de contas deve ser um texto.' })
    @IsNotEmpty({ message: 'O nome do plano de contas é obrigatório.' })
    @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
    name!: string;

    @ApiProperty({
        description: 'Máscara de níveis do plano de contas. Deve ser uma lista de números inteiros.',
        example: [1, 1, 2, 3]
    })
    @IsArray({ message: 'A máscara de níveis (levelWidths) deve ser uma lista.' })
    @ArrayMinSize(1, { message: 'O plano de contas deve ter pelo menos 1 nível.' })
    @ArrayMaxSize(10, { message: 'O plano de contas não pode exceder 10 níveis de profundidade.' }) // Limite de sanidade
    @IsInt({ each: true, message: 'Cada nível deve ser um número inteiro.' })
    @Min(1, { each: true, message: 'A largura mínima de um nível é 1.' })
    @Max(8, { each: true, message: 'A largura máxima de um único nível é 8.' }) // Impede máscaras bizarras como nível de 99 dígitos
    levelWidths!: number[];
}