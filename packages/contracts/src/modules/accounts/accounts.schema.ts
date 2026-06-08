import { z } from 'zod';
import { AccountClassEnum, BalanceTypeEnum } from '@repo/core'

export const AccountClassSchema = z.nativeEnum(AccountClassEnum);
export const BalanceTypeSchema = z.nativeEnum(BalanceTypeEnum);

export const AccountSchema = z.object({
    id: z.string().uuid().describe('UUID da conta'),
    name: z.string().min(3).max(100),
    description: z.string().nullable(),
    parentId: z.string().uuid().nullable(),
    localIndex: z.number().int().min(1),
    formattedCode: z.string().regex(/[1-9]\d*(\.[1-9]\d*)*/),
    accountClass: AccountClassSchema,
    balanceType: BalanceTypeSchema,
    isSummary: z.boolean(),
    isContra: z.boolean(),
    isActive: z.boolean()
})

const baseSchema = AccountSchema.omit({
    name: true,
    isSummary: true,

    formattedCode: true,
    balanceType: true,
});
const baseSchemaPartial = baseSchema.partial();
const extraSchema = AccountSchema.pick({
    name: true,
    isSummary: true
});
export const CreateAccountInputSchema = baseSchemaPartial.and(extraSchema)
    .refine(
        (data) => {
            // Retorna true se pelo menos um deles existir e não for nulo/undefined
            return data.accountClass !== undefined || data.parentId !== undefined;
        },
        {
            // Mensagem de erro customizada
            message: "Ao menos um entre 'accountClass' ou 'parentId' deve ser definido.",
            // Aponta o erro especificamente para os caminhos corretos (ajuda o frontend a exibir o erro no input)
            path: ['accountClass'],
        }
    );

export const PatchAccountInputSchema = AccountSchema.pick({
    name: true,
    description: true,
    isContra: true,
    isActive: true,
}).partial();

export type AccountDto = z.infer<typeof AccountSchema>;
export type CreateAccountInputDto = z.infer<typeof CreateAccountInputSchema>
export type PatchAccountInputDto = z.infer<typeof PatchAccountInputSchema>