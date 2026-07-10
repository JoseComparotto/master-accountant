import { IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AccountDto, ReplaceAccountInputDto } from './accounts.dto';

export class ChartOfAccountsDto {
    @ApiProperty({ type: () => AccountDto, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AccountDto)
    accounts!: AccountDto[];

    @ApiProperty({ type: Number, minimum: 0 })
    @IsInt()
    @Min(0)
    version!: number;
}

export class UpdateChartOfAccountsInputDto {
    @ApiProperty({ type: () => ReplaceAccountInputDto, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReplaceAccountInputDto)
    accounts!: ReplaceAccountInputDto[];
}