import { ApiProperty } from "@nestjs/swagger";

export class ChartOfAccountReturnDto {

    @ApiProperty({
        description: 'UUID do plano de contas',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id!: string;

    @ApiProperty({
        description: 'Nome do plano de contas',
        example: 'Plano de Contas Principal'
    })
    name!: string;

    @ApiProperty({
        description: 'Larguras dos níveis do plano de contas',
        example: [2, 2, 2]
    })
    levelWidths!: number[];

    @ApiProperty({
        description: 'Data de criação do plano de contas',
        example: '2023-01-01T00:00:00.000Z'
    })
    createdAt!: Date;
}