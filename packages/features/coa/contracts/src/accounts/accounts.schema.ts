import { z } from 'zod';
import { AccountClassEnum, BalanceTypeEnum } from '@repo/coa-core'
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

extendZodWithOpenApi(z);

export const AccountClassSchema = z.nativeEnum(AccountClassEnum);
export const BalanceTypeSchema = z.nativeEnum(BalanceTypeEnum);

const AccountsCapabilitiesSchema = z.object({
    canActivate: z.boolean(),
    canInactivate: z.boolean(),
});

// Nota: .openapi({readOnly: true}) faz com o que o campo seja omitido de córpos de requisição.
export const AccountSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3).max(100).openapi({
        example: 'Ativo Circulante'
    }),
    description: z.string().nullable().openapi({
        example: 'Bens e direitos com expctativa de liquidação dentro do exercício corrente.'
    }),
    parentId: z.string().uuid().nullable(),
    localIndex: z.number().int().min(1).openapi({
        example: 1
    }),
    codeDepth: z.number().int().min(1).openapi({
        example: 2,
        readOnly: true
    }),
    formattedCode: z.string().regex(/[1-9]\d*(\.[1-9]\d*)*/).openapi({
        example: '1.1',
        readOnly: true
    }),
    accountClass: AccountClassSchema.openapi({
        example: AccountClassEnum.ASSET
    }),
    balanceType: BalanceTypeSchema.openapi({
        example: BalanceTypeEnum.DEBIT,
        readOnly: true
    }),
    isSummary: z.boolean().openapi({ example: true }),
    isContra: z.boolean().openapi({ example: false }),
    isActive: z.boolean().openapi({ example: true }),
})

export const CreateAccountInputSchema = AccountSchema
    .omit({
        formattedCode: true,
        balanceType: true,
        codeDepth: true,
    }).partial().and(
        AccountSchema.pick({
            name: true
        })
    );

export const UpsertAccountInputSchema = AccountSchema
    .omit({
        id: true,
        formattedCode: true,
        balanceType: true,
        codeDepth: true,
    })

export const PatchAccountInputSchema = AccountSchema.pick({
    name: true,
    description: true,
    isContra: true,
    isActive: true,
}).partial();

export const ReplaceAccountsInputSchema = UpsertAccountInputSchema.and(
    AccountSchema.pick({id:true}).partial()
).or(CreateAccountInputSchema).array();

export type AccountDto = z.infer<typeof AccountSchema>;
export type CreateAccountInputDto = z.infer<typeof CreateAccountInputSchema>;
export type PatchAccountInputDto = z.infer<typeof PatchAccountInputSchema>;
export type UpsertAccountInputDto = z.infer<typeof UpsertAccountInputSchema>;
export type ReplaceAccountsInputDto = z.infer<typeof ReplaceAccountsInputSchema>;

export type AccountNodeDto = AccountDto & {
    children?: AccountNodeDto[];
}

export const AccountNodeSchema: z.ZodType<AccountNodeDto> = AccountSchema.and(z.object({
    children: z.lazy(() => AccountNodeSchema.array()).openapi({example: []})
}))