import { IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { VersionIncrementType } from '@modules/chart-of-accounts/domain/enums/version-increment-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChangesetDto {
  @ApiPropertyOptional({
    description: 'UUID gerado pelo cliente para garantia de idempotência. Se não fornecido, o sistema irá gerar um novo UUID v4.',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID('4', { message: 'Se fornecido, o ID deve ser um UUID v4 válido.' })
  id?: string;

  @ApiProperty({
    description: 'ID do plano de contas ao qual este changeset pertence. Deve ser um UUID v4 válido.',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID('4', { message: 'O ID do plano de contas deve ser um UUID v4 válido.' })
  chartOfAccountsId!: string;

  @ApiProperty({
    description: 'Tipo de incremento da versão. Deve ser \'major\' ou \'minor\'.',
    example: 'minor'
  })
  @IsEnum(VersionIncrementType, { message: `O tipo de incremento deve ser 'major' ou 'minor'.` })
  incrementType!: VersionIncrementType;

  @ApiPropertyOptional({
    description: 'Data de vigência do changeset. Deve ser uma string de data ISO válida.',
    example: '2023-10-01'
  })
  @IsOptional()
  @IsDateString({}, { message: 'A data de vigência deve ser uma string de data ISO válida.' })
  effectiveDate?: string;
}
