import z from 'zod';
import { AccountSchema, ReplaceAccountsInputSchema } from '../accounts/accounts.schema.js';

export const ChartOfAccountsSchema = z.object({
    accounts: AccountSchema.array(),
    version: z.number().int().nonnegative()
})

export const UpdateChartOfAccountsInputSchema = z.object({
    accounts: ReplaceAccountsInputSchema,
});

export type ChartOfAccountsDto = z.infer<typeof ChartOfAccountsSchema>;
export type UpdateChartOfAccountsInputDto =z.infer<typeof UpdateChartOfAccountsInputSchema>;