import { initContract } from "@ts-rest/core";
import { AccountSchema, CreateAccountInputSchema, PatchAccountInputSchema } from "./accounts.schema.js";
import z from "zod";

const c = initContract();

const ByIdParam = z.object({
    id: z.string().uuid()
})

const ErrorSchema = z.object({
    message: z.string().describe('Mensagem de erro.')
});

const PREFIX = '/accounts';

export const accountsContract = c.router({

    getAll: {
        method: 'GET', path: '/',
        responses: {
            200: AccountSchema.array()
        }
    },

    getById: {
        method: 'GET', path: '/:id',
        pathParams: ByIdParam,
        responses: {
            200: AccountSchema,
            404: ErrorSchema.describe('Conta não encontrada.')
        }
    },

    create: {
        method: 'POST', path: '/',
        body: CreateAccountInputSchema,
        responses: {
            201: AccountSchema,
            400: ErrorSchema.describe('Requisição mal formada.'),
            404: ErrorSchema.describe('O parentId fornecido não existe.'),
            409: ErrorSchema.describe('Identificação única em conflito.'),
            422: ErrorSchema.describe('O objeto enviado viola invariantes de domínio.'),
        }
    },
    patch: {
        method: 'PATCH', path: '/:id',
        pathParams: ByIdParam,
        body: PatchAccountInputSchema,
        responses: {
            200: AccountSchema,
            422: ErrorSchema
        }
    },
    inactivate: {
        method: 'PATCH', path: '/:id/inactivate',
        pathParams: ByIdParam,
        body: z.undefined(),
        responses: {
            200: AccountSchema,
            422: ErrorSchema
        }
    },
    activate: {
        method: 'PATCH', path: '/:id/activate',
        pathParams: ByIdParam,
        body: z.undefined(),
        responses: {
            200: AccountSchema,
            422: ErrorSchema
        }
    },
}, {
    pathPrefix: PREFIX
});