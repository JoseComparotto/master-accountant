import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class UuidParamDto {
    @ApiProperty({
        description: 'ID do recurso, deve ser um UUID v4 válido',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID('4', { message: 'O ID deve ser um UUID v4 válido' })
    id!: string;
}