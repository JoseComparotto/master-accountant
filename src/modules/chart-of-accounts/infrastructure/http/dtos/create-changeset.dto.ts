import { IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { VersionIncrementType } from '../../../domain/enumns/version-increment-type.enum';

export class CreateChangesetDto {
  @IsUUID()
  chartOfAccountsId!: string;

  @IsEnum(VersionIncrementType)
  incrementType!: VersionIncrementType;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string; 
}
