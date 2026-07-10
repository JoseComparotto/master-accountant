import { IsIn, IsString, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { CreateAccountInputDto } from './accounts.dto';

export class CoaPatchOperation {
    @ApiProperty({ 
        enum: ['add', 'replace'], 
        description: 'Tipo de operação JSON Patch',
        example: 'replace' 
    })
    @IsIn(['add', 'replace'])
    op!: 'add' | 'replace';

    @ApiProperty({ 
        type: String, 
        description: 'Caminho do recurso. Aceita /accounts/- para criação ou /accounts/:id/:atributo para modificação.',
        example: '/accounts/6e781555-ae0c-4e0b-9603-988cde29bdd4/name' 
    })
    @IsString()
    @Matches(/^\/accounts\/([^\/]+)(\/[^\/]+)?$/)
    path!: string;

    @ApiPropertyOptional({
        oneOf: [
            { $ref: getSchemaPath(CreateAccountInputDto) },
            { type: 'string' },
            { type: 'boolean' }
        ],
        nullable: true,
        description: 'Valor a ser aplicado. Aceita o DTO de criação de conta (para op add) ou valores primitivos (para op replace).',
        example: 'Novo Nome da Conta'
    })
    @IsOptional()
    value!: CreateAccountInputDto | string | boolean;
}