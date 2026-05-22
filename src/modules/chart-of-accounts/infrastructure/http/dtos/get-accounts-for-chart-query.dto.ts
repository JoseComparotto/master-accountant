import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString } from "class-validator";

export class GetAccountsForChartQueryDto {
    @ApiPropertyOptional({
        description: 'Data de referência para obter a árvore de contas. Se não fornecida, será retornado o estado mais recente. Deve ser uma string de data ISO válida.',
        example: '2023-10-01'
    })
    @IsOptional()
    @IsDateString({}, { message: 'A data deve ser uma string de data ISO válida.' })
    date?: string;
}