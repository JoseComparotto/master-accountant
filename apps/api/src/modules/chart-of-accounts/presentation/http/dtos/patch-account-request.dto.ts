import { AccountPatchDto } from '../../../application/types/accounts.types';
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PatchAccountRequestDto implements AccountPatchDto {


    @IsString()
    @MaxLength(255, { message: 'O nome da conta deve ter no máximo 255 caracteres.' })
    @ApiPropertyOptional({
        description: 'Nome da conta. Deve ser único e descritivo.',
        example: 'Ativo Circulante'
    })
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'A descrição da conta deve ter no máximo 1000 caracteres.' })
    @ApiPropertyOptional({
        description: 'Descrição opcional da conta para fornecer informações adicionais.',
        example: 'Bens e direitos com expctativa de liquidação dentro do exercício corrente.'
    })
    description?: string | null;

    @IsOptional()
    @IsBoolean({ message: 'O campo isContra deve ser um valor booleano.' })
    @ApiPropertyOptional({
        description: 'Indica se a conta é redutora. Contas redutoras tem natureza de saldo oposta ao da sua classe.',
        example: false,
        default: false
    })
    isContra?: boolean;


}