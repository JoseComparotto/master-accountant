import { IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { VersionIncrementType } from '../../../domain/enumns/version-increment-type.enum';

export class CreateChangesetDto {
  @IsOptional()
  @IsUUID('4', { message: 'Se fornecido, o ID deve ser um UUID v4 válido.' })
  id?: string;

  @IsUUID('4', { message: 'O ID do plano de contas deve ser um UUID v4 válido.' })
  chartOfAccountsId!: string;

  @IsEnum(VersionIncrementType, { message: `O tipo de incremento deve ser 'major' ou 'minor'.` })
  incrementType!: VersionIncrementType;

  @IsOptional()
  @IsDateString({}, { message: 'A data de vigência deve ser uma string de data ISO válida.' })
  effectiveDate?: string;
}
