import { ApiPropertyOptional } from '@nestjs/swagger';
import { PatchAccountInputDto } from '@repo/contracts';

export class PatchAccountRequestDto implements PatchAccountInputDto {

    @ApiPropertyOptional({
        description: 'Nome da conta. Deve ser único e descritivo.',
        example: 'Ativo Circulante'
    })
    name?: string;

    @ApiPropertyOptional({
        description: 'Descrição opcional da conta para fornecer informações adicionais.',
        example: 'Bens e direitos com expctativa de liquidação dentro do exercício corrente.'
    })
    description?: string | null;

    @ApiPropertyOptional({
        description: 'Indica se a conta é redutora. Contas redutoras tem natureza de saldo oposta ao da sua classe.',
        example: false,
    })
    isContra?: boolean;

    @ApiPropertyOptional({
        description: 'Indica se a conta está ativa.',
        example: true,
    })
    isActive?: boolean;
}