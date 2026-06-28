import { initContract } from "@ts-rest/core";
import { ChartOfAccountsSchema, UpdateChartOfAccountsInputSchema } from "./coa.schema.js";
import { accountsContract } from "../accounts/accounts.contract.js";
import z from "zod";
import { ApiErrorSchema } from "../shared/error.schema.js";
import { JsonPatchOperationSchema } from "../shared/json-patch.schema.js";

const PREFIX = '/coa';

const c = initContract();

export const coaContract = c.router({
    get: {
        method: 'GET', path: '/',
        responses: {
            200: ChartOfAccountsSchema
        }
    },
    update: {
        method: 'PUT', path: '/',
        headers: z.object({
            'if-match': z.string({ required_error: 'O cabeçalho If-Match é obrigatório.' }).regex(/^(?:W\/)?"\d+"$/g),
        }),
        body: UpdateChartOfAccountsInputSchema,
        responses: {
            200: ChartOfAccountsSchema.describe('Recurso atualizado com sucesso.'),
            400: ApiErrorSchema.describe('Requisição mal formada.'),
            412: ChartOfAccountsSchema.describe('O recurso já foi modificado por outro agente.'),
            404: ApiErrorSchema.describe('O parentId fornecido não existe.'),
            409: ApiErrorSchema.describe('Identificação única em conflito.'),
            422: ApiErrorSchema.describe('O objeto enviado viola invariantes de domínio.'),
        }
    },
    patch: {
        method: 'PATCH',
        path: '/',
        headers: z.object({
            'if-match': z.string({ required_error: 'O cabeçalho If-Match é obrigatório.' }).regex(/^(?:W\/)?"\d+"$/g),
        }),
        body: z.array(JsonPatchOperationSchema),
        responses: {
            200: ChartOfAccountsSchema, 
            400: ApiErrorSchema.describe('Requisição mal formada.'),
            412: ChartOfAccountsSchema.describe('O recurso já foi modificado por outro agente.'),
            404: ApiErrorSchema.describe('O parentId fornecido não existe.'),
            409: ApiErrorSchema.describe('Identificação única em conflito.'),
            422: ApiErrorSchema.describe('O objeto enviado viola invariantes de domínio.'),
        },
        metadata: {
            summary: 'Atualiza o Plano de Contas em lote via JSON Patch (RFC 6902)',
        },
    },
}, {
    pathPrefix: PREFIX
})