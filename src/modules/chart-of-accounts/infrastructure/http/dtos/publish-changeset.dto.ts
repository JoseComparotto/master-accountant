import { IsOptional, IsDateString } from 'class-validator';

export class PublishChangesetDto {
  @IsOptional()
  @IsDateString()
  effectiveDate?: string; // Opcional, caso queira definir ou sobrescrever a data no momento da publicação
}