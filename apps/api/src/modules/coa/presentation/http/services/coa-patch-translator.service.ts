import { Injectable, BadRequestException } from '@nestjs/common';
import { CoaBatchAction } from '../../../application/commands/apply-coa-batch-actions/apply-coa-batch-actions.command';
import { CreateAccountCommand } from '../../../application/commands/create-account/create-account.command';
import { CreateAccountInputSchema, JsonPatchOperation, PatchAccountInputSchema } from '@repo/coa-contracts';
import { PatchAccountCommand } from '../../../application/commands/patch-account/patch-account.command';

@Injectable()
export class CoaPatchTranslator {

    /**
     * Traduz um array de operações JSON Patch para uma lista de Comandos de Aplicação
     */
    public translateBatch(operations: JsonPatchOperation[]): CoaBatchAction[] {
        return operations.map((op) => this.translateOperation(op));
    }

    /**
     * Traduz uma única operação individual usando Pattern Matching por Regex
     */
    private translateOperation(op: JsonPatchOperation): CoaBatchAction {
        // 1. Regex para capturar Criação: {"op": "add", "path": "/accounts/:id"}
        const createMatch = op.path.match(/^\/accounts\/([^\/]+)$/);

        if (createMatch && op.op === 'add') {
            const [, accountId] = createMatch;

            const data = CreateAccountInputSchema.parse(op.value);

            return new CreateAccountCommand({
                ...data,
                id: accountId !== '-' ? accountId : undefined
            });
        }

        // 2. Regex para capturar Modificação: {"op": "replace", "path": "/accounts/:id/:attr"}
        const patchMatch = op.path.match(/^\/accounts\/([^\/]+)\/([^\/]+)$/);

        if (patchMatch && op.op === 'replace') {
            const [, accountId, attribute] = patchMatch;

            const patch = PatchAccountInputSchema.parse({
                [attribute!]: op.value
            })

            return new PatchAccountCommand(accountId!, patch);
        }

        // Caso o cliente envie algo fora do contrato estipulado (ex: op 'remove' ou path bizarro)
        throw new BadRequestException(
            `Operação JSON Patch não suportada ou rota inválida: [${op.op}] ${op.path}`
        );
    }
}