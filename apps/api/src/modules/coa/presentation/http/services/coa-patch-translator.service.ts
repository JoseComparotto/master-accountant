import { Injectable, BadRequestException } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { CoaBatchAction } from '../../../application/commands/apply-coa-batch-actions/apply-coa-batch-actions.command';
import { CreateAccountCommand } from '../../../application/commands/create-account/create-account.command';
import { PatchAccountCommand } from '../../../application/commands/patch-account/patch-account.command';

import { CoaPatchOperation } from '../dtos/coa-patch-operation.dto';
import { CreateAccountInputDto, PatchAccountInputDto } from '../dtos/accounts.dto';

@Injectable()
export class CoaPatchTranslator {

    /**
     * Traduz um array de operações JSON Patch para uma lista de Comandos de Aplicação
     */
    public translateBatch(operations: CoaPatchOperation[]): CoaBatchAction[] {
        return operations.map((op) => this.translateOperation(op));
    }

    /**
     * Traduz uma única operação individual usando Pattern Matching por Regex
     */
    private translateOperation(op: CoaPatchOperation): CoaBatchAction {
        // 1. Regex para capturar Criação: {"op": "add", "path": "/accounts/:id"}
        const createMatch = op.path.match(/^\/accounts\/([^\/]+)$/);

        if (createMatch && op.op === 'add') {
            const [, accountId] = createMatch;

            const createDto = plainToInstance(CreateAccountInputDto, op.value);

            const errors = validateSync(createDto, { 
                whitelist: true, 
                forbidNonWhitelisted: true 
            });

            if (errors.length > 0) {
                throw new BadRequestException({
                    message: `Falha na validação da nova conta enviada no JSON Patch`,
                    errors: errors.map(err => Object.values(err.constraints || {})).flat()
                });
            }

            return new CreateAccountCommand({
                ...createDto,
                id: accountId !== '-' ? accountId : undefined
            });
        }

        // 2. Regex para capturar Modificação: {"op": "replace", "path": "/accounts/:id/:attr"}
        const patchMatch = op.path.match(/^\/accounts\/([^\/]+)\/([^\/]+)$/);

        if (patchMatch && op.op === 'replace') {
            const [, accountId, attribute] = patchMatch;

            // Monta o objeto plano com a propriedade dinâmica informada no path do JSON Patch
            const rawPatch = { [attribute!]: op.value };

            // Transforma o objeto plano numa instância da classe DTO para expor os metadados dos decoradores
            const patchDto = plainToInstance(PatchAccountInputDto, rawPatch);

            // Executa a validação síncrona equivalente ao antigo .parse() do Zod
            const errors = validateSync(patchDto, { 
                whitelist: true, 
                forbidNonWhitelisted: true 
            });

            if (errors.length > 0) {
                throw new BadRequestException({
                    message: `Falha na validação do atributo '${attribute}' enviado no JSON Patch`,
                    errors: errors.map(err => Object.values(err.constraints || {})).flat()
                });
            }

            return new PatchAccountCommand(accountId!, patchDto);
        }

        // Caso o cliente envie algo fora do contrato estipulado (ex: op 'remove' ou path bizarro)
        throw new BadRequestException(
            `Operação JSON Patch não suportada ou rota inválida: [${op.op}] ${op.path}`
        );
    }
}