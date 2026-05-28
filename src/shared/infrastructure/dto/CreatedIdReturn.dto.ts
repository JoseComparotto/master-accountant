import { ApiProperty } from "@nestjs/swagger";

export class CreatedIdReturnDto {
    
    @ApiProperty({
        description: 'ID do recurso criado. Será um UUID v4 válido',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id!: string;
}