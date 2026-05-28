import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class ChartIdParamDto {
    @ApiProperty({
        description: 'ID do Plano de Contas (Chart of Accounts). Deve ser um UUID v4 válido.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID('4', { message: 'O ID do plano de contas deve ser um UUID v4 válido.' })
    chartId!: string;
}