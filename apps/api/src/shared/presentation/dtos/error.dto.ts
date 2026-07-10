import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
    @ApiProperty({ type: Number, example: 400 })
    @IsNumber()
    statusCode!: number;

    @ApiProperty({ type: String, example: '/api/accounts' })
    @IsString()
    path!: string;

    @ApiProperty({ type: String, example: 'Falha na validação dos dados enviados.' })
    @IsString()
    message!: string;

    @ApiProperty({ type: Object, required: false })
    @IsObject()
    @IsOptional()
    details?: Record<string, any>;

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    timestamp?: string;
}