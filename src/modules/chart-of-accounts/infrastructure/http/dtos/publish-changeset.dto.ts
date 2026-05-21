import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class PublishChangesetDto {
  @ApiPropertyOptional({
    description: 'Data de vigência do changeset. Deve ser uma string de data ISO válida.',
    example: '2023-10-01'
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string; // Opcional, caso queira definir ou sobrescrever a data no momento da publicação
}