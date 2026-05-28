import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from "class-validator";

export class CreateAccountQueryDto {
    @ApiPropertyOptional({
        description: 'Indica se a conta deve ser publicada automaticamente após a criação. Se true, a conta será publicada imediatamente. Se false, a conta será criada como rascunho e precisará ser publicada manualmente posteriormente.',
        example: true,
        default: false,
    })
    @IsBoolean({ message: 'O valor de autoPublish deve ser um booleano (true ou false).' })
    autoPublish: boolean = false;

    @ApiPropertyOptional({
        description: 'ID do changeset a ser associado à criação da conta. Este campo é obrigatório se autoPublish for false, e deve ser omitido ou nulo se autoPublish for true.',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ValidateIf(o => o.autoPublish === false)
    @IsNotEmpty({ message: 'O parâmetro changesetId é obrigatório quando autoPublish é false.' })
    @IsUUID('4', { message: 'O ID do changeset deve ser um UUID v4 válido.' })
    changesetId?: string;
    
    @ApiPropertyOptional({
        description: 'Data efetiva para a criação da conta. Se fornecida, a conta será criada com esta data como referência para cálculos de saldo e outras operações dependentes de data. Se não fornecida, a data atual será usada.',
        example: '2024-07-01',
    })
    @IsDateString({}, { message: 'A data efetiva deve estar no formato ISO 8601 (YYYY-MM-DD).' })
    effectiveDate?: string;

}