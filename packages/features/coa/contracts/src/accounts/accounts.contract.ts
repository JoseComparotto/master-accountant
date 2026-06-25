import { initContract } from "@ts-rest/core";
import { AccountNodeSchema, AccountSchema, CreateAccountInputSchema, PatchAccountInputSchema, ReplaceAccountsInputSchema, UpsertAccountInputSchema } from "./accounts.schema.js";
import z from "zod";
import { ApiErrorSchema } from "../shared/error.schema.js";

const c = initContract();

const ByIdParam = z.object({
    id: z.string().uuid()
})

const PREFIX = '/coa/accounts';

export const accountsContract = c.router({

    getAll: {
        method: 'GET', path: '/',
        responses: {
            200: AccountSchema.array().describe('Lista de contas.'),
            400: ApiErrorSchema.describe('Requisição mal formada.'),
        }
    },

    getTree: {
        method: 'GET', path: '/tree',
        responses: {
            200: AccountNodeSchema.array().describe('Árvore de contas.'),
            400: ApiErrorSchema.describe('Requisição mal formada.'),
        }
    },

    getById: {
        method: 'GET', path: '/:id',
        pathParams: ByIdParam,
        responses: {
            200: AccountSchema.describe('Conta retornada com sucesso.'),
            400: ApiErrorSchema.describe('Requisição mal formada.'),
            404: ApiErrorSchema.describe('Conta não encontrada.')
        }
    },

    create: {
        method: 'POST', path: '/',
        body: CreateAccountInputSchema,
        responses: {
            201: AccountSchema.describe('Conta criada com sucesso.'),
            400: ApiErrorSchema.describe('Requisição mal formada.'),
            404: ApiErrorSchema.describe('O parentId fornecido não existe.'),
            409: ApiErrorSchema.describe('Identificação única em conflito.'),
            422: ApiErrorSchema.describe('O objeto enviado viola invariantes de domínio.'),
        }
    },

    upsert: {
        method: 'PUT', path: '/:id',
        pathParams: ByIdParam,
        body: UpsertAccountInputSchema,
        responses: {
            201: AccountSchema.describe('Conta criada com sucesso.'),
            200: AccountSchema.describe('Conta atualizada com sucesso.'),
            400: ApiErrorSchema.describe('Requisição mal formada.'),
            404: ApiErrorSchema.describe('O parentId fornecido não existe.'),
            422: ApiErrorSchema.describe('O objeto enviado viola invariantes de domínio.'),
        }
    },

    replaceAll: {
        method: 'PUT', path: '/',
        body: ReplaceAccountsInputSchema,
        responses:{
            200: AccountSchema.array().describe('Lista atualizada com sucesso.'),
            400: ApiErrorSchema.describe('Requisição mal formada.'),
            404: ApiErrorSchema.describe('O parentId fornecido não existe.'),
            409: ApiErrorSchema.describe('Identificação única em conflito.'),
            422: ApiErrorSchema.describe('O objeto enviado viola invariantes de domínio.'),
        }
    },

    patch: {
        method: 'PATCH', path: '/:id',
        pathParams: ByIdParam,
        body: PatchAccountInputSchema,
        responses: {
            200: AccountSchema.describe('Conta atualizada com sucesso.'),
            422: ApiErrorSchema.describe('O objeto enviado viola invariantes de domínio.'),
        }
    },
    inactivate: {
        method: 'PATCH', path: '/:id/inactivate',
        pathParams: ByIdParam,
        body: z.undefined(),
        responses: {
            200: AccountSchema.describe('Conta inativada com sucesso.'),
            422: ApiErrorSchema.describe('Não foi possivel inativar a conta.'),
        }
    },
    activate: {
        method: 'PATCH', path: '/:id/activate',
        pathParams: ByIdParam,
        body: z.undefined(),
        responses: {
            200: AccountSchema.describe('Conta ativada com sucesso.'),
            422: ApiErrorSchema.describe('Não foi possivel ativar a conta.'),
        }
    },
}, {
    pathPrefix: PREFIX
});