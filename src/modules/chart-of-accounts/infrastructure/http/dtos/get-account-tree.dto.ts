import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsUUID, IsOptional, IsDateString } from "class-validator";

export class GetAccountTreeDto {
    @ApiProperty({
        description: 'ID do Plano de Contas (Chart of Accounts) para o qual a árvore de contas deve ser obtida. Deve ser um UUID v4 válido.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID('4', { message: 'O ID do plano de contas deve ser um UUID v4 válido.' })
    chartId!: string;   

    @ApiPropertyOptional({
        description: 'Data de referência para obter a árvore de contas. Se não fornecida, será retornado o estado mais recente. Deve ser uma string de data ISO válida.',
        example: '2023-10-01'
    })
    @IsOptional()
    @IsDateString({}, { message: 'A data deve ser uma string de data ISO válida.' })
    date?: string;
}