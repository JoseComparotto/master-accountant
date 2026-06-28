import z from "zod";

export const JsonPatchOperationSchema = z.object({
  op: z.enum(['add', 'remove', 'replace', 'move', 'copy', 'test']),
  path: z.string().regex(/^(?:\/(?:[^~/]|~0|~1)*)*$/, 'O path deve ser um JSON Pointer (RFC 6901) válido.')
    .openapi({example: '/accounts/new-account-uuid'}),
  value: z.any().optional(),
  from: z.string().optional(),
});

export type JsonPatchOperation = z.infer<typeof JsonPatchOperationSchema>;