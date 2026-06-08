import { z } from 'zod';
import { AccountClassEnum, BalanceTypeEnum } from '@repo/core'
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

extendZodWithOpenApi(z);

export const AccountClassSchema = z.nativeEnum(AccountClassEnum);
export const BalanceTypeSchema = z.nativeEnum(BalanceTypeEnum);

export const AccountSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3).max(100).openapi({ example: 'Ativo Circulante' }),
    description: z.string().nullable().openapi({ example: 'Bens e direitos com expctativa de liquidação dentro do exercício corrente.' }),
    parentId: z.string().uuid().nullable(),
    localIndex: z.number().int().min(1).openapi({ example: 1 }),
    formattedCode: z.string().regex(/[1-9]\d*(\.[1-9]\d*)*/).openapi({ example: '1.1' }),
    accountClass: AccountClassSchema.openapi({ example: AccountClassEnum.ASSET }),
    balanceType: BalanceTypeSchema.openapi({ example: BalanceTypeEnum.DEBIT }),
    isSummary: z.boolean().openapi({ example: true }),
    isContra: z.boolean().openapi({ example: false }),
    isActive: z.boolean().openapi({ example: true }),
})

export const CreateAccountInputSchema = AccountSchema
    .omit({
        formattedCode: true,
        balanceType: true,
    }).partial().and(
        AccountSchema.pick({
            name: true,
            isSummary: true
        })
    );

export const UpsertAccountInputSchema = AccountSchema
    .omit({
        id: true,
        formattedCode: true,
        balanceType: true,
    })

export const PatchAccountInputSchema = AccountSchema.pick({
    name: true,
    description: true,
    isContra: true,
    isActive: true,
}).partial();

export type AccountDto = z.infer<typeof AccountSchema>;
export type CreateAccountInputDto = z.infer<typeof CreateAccountInputSchema>;
export type PatchAccountInputDto = z.infer<typeof PatchAccountInputSchema>;
export type UpsertAccountInputDto = z.infer<typeof UpsertAccountInputSchema>;