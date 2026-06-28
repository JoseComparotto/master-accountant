import { inject, Injectable } from "@angular/core";
import {
    AccountCreatedEvent,
    AccountUpdatedEvent,
    ChartOfAccountsCreatedEvent,
    ChartOfAccountsEntity,
    IChartOfAccountsRepository,
    VersionValue
} from "@repo/coa-core";
import { CoaApiClient } from "../services/coa-api-client";
import { from, map, Observable } from "rxjs";
import { fromDtoToProps } from "../../application/mappers/from-dto-to-props.mapper";
import { fromDomainToDto } from "../../application/mappers/from-props-to-dto.mapper";
import { ValueObject } from "@repo/shared-core";

@Injectable()
export class ApiChartOfAccountsRepository implements IChartOfAccountsRepository {
    private readonly client = inject(CoaApiClient);

    getUnique(): Observable<ChartOfAccountsEntity> {
        return from(this.client.coa.get())
            .pipe(
                map(({ status, body }) => {
                    if (status === 200) {
                        const accountProps = body.accounts.map(fromDtoToProps);

                        return ChartOfAccountsEntity.reconstitute(
                            accountProps,
                            VersionValue.create(body.version)
                        );
                    }

                    console.error(body);
                    throw new Error("Erro ao buscar contas");
                })
            );
    }

    save(chart: ChartOfAccountsEntity): Observable<ChartOfAccountsEntity> {
        const events = chart.domainEvents;
        if (events.length === 0) return this.getUnique();
        chart.clearDomainEvents();

        // 1. Fallback temporário: se houver criação do plano, faz um PUT completo
        if (events.some(e => e instanceof ChartOfAccountsCreatedEvent)) {
            return this.putCoa(chart);
        }

        const etag = `"${chart.version.value}"`;

        // 2. Mapeia os eventos DIRETAMENTE para itens do JSON Patch na MESMA ordem cronológica
        const operations = events.map(event => {

            // Cenário de Criação de Conta (op: "add")
            if (event instanceof AccountCreatedEvent) {
                return {
                    op: 'add' as const,
                    path: `/accounts/${event.accountId}`,
                    value: {
                        ...event.accountProps,
                        name: event.accountProps.name.value,
                        localIndex: event.accountProps.structuralCode.localIndex,
                        parentId: event.accountProps.parentId?.value ?? null,
                    }
                };
            }

            // Cenário de Atualização de Atributo da Conta (op: "replace")
            if (event instanceof AccountUpdatedEvent) {
                // Preserva a extração de Value Objects primitivos se necessário (.value)
                const rawValue = event.newValue && event.newValue instanceof ValueObject
                    ? event.newValue.value
                    : event.newValue;

                return {
                    op: 'replace' as const,
                    path: `/accounts/${event.accountId}/${event.attribute}`,
                    value: rawValue
                };
            }

            return null;
        }).filter((op): op is NonNullable<typeof op> => op !== null);

        // 3. Dispara o tiro único de PATCH atômico para a raiz do Agregado (/coa)
        return from(this.client.coa.patch({
            headers: {
                'if-match': etag,
                // 'content-type': 'application/json-patch+json'
            },
            body: operations,
        })).pipe(
            map(({ status, body }) => {
                switch (status) {
                    case 200:
                        const accountProps = body.accounts.map(fromDtoToProps);

                        return ChartOfAccountsEntity.reconstitute(
                            accountProps,
                            VersionValue.create(body.version)
                        );
                    case 412:
                        throw new Error("O plano já foi modificado por outro agente.");
                    default:
                        console.error(body);
                        throw new Error("Erro ao aplicar lote de alterações via JSON Patch");
                }
            })
        );
    }

    private putCoa(chart: ChartOfAccountsEntity): Observable<ChartOfAccountsEntity> {
        const etag = `"${chart.version.value}"`;

        return from(this.client.coa.update({
            headers: { 'if-match': etag },
            body: {
                accounts: chart.accounts.map(fromDomainToDto),
            }
        })).pipe(
            map(({ status, body }) => {
                switch (status) {
                    case 200:
                        const accountProps = body.accounts.map(fromDtoToProps);

                        return ChartOfAccountsEntity.reconstitute(
                            accountProps,
                            VersionValue.create(body.version)
                        );
                    case 412:
                        throw new Error("O plano já foi modificado por outro agente.");
                    default:
                        console.error(body);
                        throw new Error("Erro ao salvar contas");
                }
            })
        );
    }
}