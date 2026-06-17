import z from "zod";

export const ApiErrorSchema = z.object({
    statusCode: z.number(),
    path: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
    timestamp: z.string().datetime().optional()
});

export type ApiErrorDto = z.infer<typeof ApiErrorSchema>;