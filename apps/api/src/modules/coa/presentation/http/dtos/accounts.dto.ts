import { IsString, IsUUID, IsInt, Min, Length, IsOptional, IsBoolean, IsEnum, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountClassEnum, BalanceTypeEnum } from '@repo/coa-core';

export class AccountDto {
    @ApiProperty({ type: String, format: 'uuid' })
    @IsUUID()
    id!: string;

    @ApiProperty({ type: String, minLength: 3, maxLength: 100, example: 'Ativo Circulante' })
    @IsString()
    @Length(3, 100)
    name!: string;

    @ApiPropertyOptional({
        type: String,
        nullable: true,
        example: 'Bens e direitos com expectativa de liquidação dentro do exercício corrente.'
    })
    @IsString()
    @IsOptional()
    description?: string | null;

    @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
    @IsUUID()
    @IsOptional()
    parentId?: string | null;

    @ApiProperty({ type: Number, minimum: 1, example: 1 })
    @IsInt()
    @Min(1)
    localIndex!: number;

    @ApiProperty({ type: Number, minimum: 1, readOnly: true, example: 2 })
    @IsInt()
    @Min(1)
    codeDepth!: number;

    @ApiProperty({ type: String, readOnly: true, example: '1.1' })
    @IsString()
    @Matches(/[1-9]\d*(\.[1-9]\d*)*/)
    formattedCode!: string;

    @ApiProperty({ enum: AccountClassEnum })
    @IsEnum(AccountClassEnum)
    accountClass!: AccountClassEnum;

    @ApiProperty({ enum: BalanceTypeEnum, readOnly: true })
    @IsEnum(BalanceTypeEnum)
    balanceType!: BalanceTypeEnum;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isSummary!: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isContra!: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isActive!: boolean;
}

export class CreateAccountInputDto {
    @ApiProperty({ type: String, format: 'uuid', required: false })
    @IsUUID()
    @IsOptional()
    id?: string;

    @ApiProperty({ type: String, minLength: 3, maxLength: 100, example: 'Ativo Circulante' })
    @IsString()
    @Length(3, 100)
    name!: string;

    @ApiProperty({ type: String, nullable: true, required: false })
    @IsString()
    @IsOptional()
    description?: string | null;

    @ApiProperty({ type: String, format: 'uuid', nullable: true, required: false })
    @IsUUID()
    @IsOptional()
    parentId?: string | null;

    @ApiProperty({ type: Number, minimum: 1, required: false })
    @IsInt()
    @Min(1)
    @IsOptional()
    localIndex?: number;

    @ApiProperty({ enum: AccountClassEnum, required: false })
    @IsEnum(AccountClassEnum)
    @IsOptional()
    accountClass?: AccountClassEnum;

    @ApiProperty({ type: Boolean, required: false })
    @IsBoolean()
    @IsOptional()
    isSummary?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsBoolean()
    @IsOptional()
    isContra?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpsertAccountInputDto {
    @ApiProperty({ type: String, minLength: 3, maxLength: 100 })
    @IsString()
    @Length(3, 100)
    name!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    @IsString()
    @IsOptional()
    description?: string | null;

    @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
    @IsUUID()
    @IsOptional()
    parentId?: string | null;

    @ApiProperty({ type: Number, minimum: 1 })
    @IsInt()
    @Min(1)
    localIndex!: number;

    @ApiProperty({ enum: AccountClassEnum })
    @IsEnum(AccountClassEnum)
    accountClass!: AccountClassEnum;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isSummary!: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isContra!: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isActive!: boolean;
}

export class PatchAccountInputDto {
    @ApiProperty({ type: String, minLength: 3, maxLength: 100, required: false })
    @IsString()
    @Length(3, 100)
    @IsOptional()
    name?: string;

    @ApiProperty({ type: String, nullable: true, required: false })
    @IsString()
    @IsOptional()
    description?: string | null;

    @ApiProperty({ type: Boolean, required: false })
    @IsBoolean()
    @IsOptional()
    isContra?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class ReplaceAccountInputDto {
    @ApiProperty({ type: String, format: 'uuid', required: false })
    @IsUUID()
    @IsOptional()
    id?: string;

    @ApiProperty({ type: String, minLength: 3, maxLength: 100 })
    @IsString()
    @Length(3, 100)
    name!: string;

    @ApiProperty({ type: String, nullable: true, required: false })
    @IsString()
    @IsOptional()
    description?: string | null;

    @ApiProperty({ type: String, format: 'uuid', nullable: true, required: false })
    @IsUUID()
    @IsOptional()
    parentId?: string | null;

    @ApiProperty({ type: Number, minimum: 1, required: false })
    @IsInt()
    @Min(1)
    @IsOptional()
    localIndex?: number;

    @ApiProperty({ enum: AccountClassEnum, required: false })
    @IsEnum(AccountClassEnum)
    @IsOptional()
    accountClass?: AccountClassEnum;

    @ApiProperty({ type: Boolean, required: false })
    @IsBoolean()
    @IsOptional()
    isSummary?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsBoolean()
    @IsOptional()
    isContra?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class AccountNodeDto extends AccountDto {
    @ApiProperty({ type: () => [AccountNodeDto], required: false })
    @IsOptional()
    children?: AccountNodeDto[];
}