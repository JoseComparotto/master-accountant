import { inject, Injectable } from "@angular/core";
import {
    AccountCreatedEvent,
    AccountsEvents,
    AccountUpdatedEvent,
    ChartOfAccountsCreatedEvent,
    ChartOfAccountsEntity,
    GetUniqueOptions,
    IChartOfAccountsRepository,
    VersionValue
} from "@repo/coa-core";
import { CoaApiClient } from "../services/coa-api-client";
import { BehaviorSubject, from, map, Observable, defer, merge, ignoreElements, filter, shareReplay, finalize } from "rxjs";
import { fromDtoToProps } from "../../application/mappers/from-dto-to-props.mapper";
import { fromDomainToDto } from "../../application/mappers/from-props-to-dto.mapper";
import { ValueObject } from "@repo/shared-core";
import { ChartOfAccountsDto, CoaPatchOperation } from "@repo/coa-contracts";

export class ConcurrencyConflictError extends Error {
    constructor(
        public readonly serverChart: ChartOfAccountsEntity,
        public readonly localChart: ChartOfAccountsEntity,
    ) {
        super("O plano de contas já foi modificado por outro agente.");
        this.name = 'ConcurrencyConflictError';
    }
}

type CoaResponse = { status: 200 | 412, body: ChartOfAccountsDto } | { status: number, body: any };

@Injectable()
export class ApiChartOfAccountsRepository implements IChartOfAccountsRepository {
    private readonly client = inject(CoaApiClient);
    private readonly chart$ = new BehaviorSubject<ChartOfAccountsEntity | null>(null);
    
    private ongoingFetch$: Observable<ChartOfAccountsEntity> | null = null;

    getUnique(options: GetUniqueOptions = { consistency: 'eventual' }): Observable<ChartOfAccountsEntity> {
        // if (options.consistency === 'strong') {
        //     return this.fetchUniqueFromApi();
        // }

        return defer(() => {
            const continuousStream$ = this.chart$.asObservable().pipe(
                filter((chart): chart is ChartOfAccountsEntity => chart !== null)
            );

            if (!this.chart$.value  || options.consistency === 'strong') {
                return merge(
                    this.fetchUniqueFromApi().pipe(ignoreElements()),
                    continuousStream$
                );
            }

            return continuousStream$;
        });
    }

    private fetchUniqueFromApi(): Observable<ChartOfAccountsEntity> {
        if (this.ongoingFetch$) {
            return this.ongoingFetch$;
        }

        this.ongoingFetch$ = from(this.client.coa.get()).pipe(
            map(response => this.processCoaResponse(response)),
            finalize(() => this.ongoingFetch$ = null),
            shareReplay(1) // Compartilha o resultado caso múltiplos componentes assinem ao mesmo tempo
        );

        return this.ongoingFetch$;
    }

    save(chart: ChartOfAccountsEntity, matchVersion: VersionValue = chart.version): Observable<ChartOfAccountsEntity> {
        const hasChartCreatedEvent = chart.domainEvents.some(
            (event): event is ChartOfAccountsCreatedEvent => event instanceof ChartOfAccountsCreatedEvent
        );

        if (hasChartCreatedEvent) {
            return this.putCoa(chart);
        }

        const accountEvents = chart.domainEvents.filter(
            (event): event is AccountsEvents => !(event instanceof ChartOfAccountsCreatedEvent)
        );

        if (accountEvents.length === 0) return this.getUnique();

        const etag = `"${matchVersion.value}"`;
        const operations = this.buildPatchOperations(accountEvents);

        return from(this.client.coa.patch({
            headers: { 'if-match': etag },
            body: operations,
        })).pipe(
            map((response) => this.processCoaResponse(response, chart))
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
            map((response) => this.processCoaResponse(response, chart))
        );
    }

    private processCoaResponse(response: CoaResponse, originalChart?: ChartOfAccountsEntity): ChartOfAccountsEntity {
        const { status, body } = response;
        switch (status) {
            case 200:
                const updatedChart = this.reconstituteFromDto(body);

                originalChart?.clearDomainEvents();
                this.chart$.next(updatedChart);

                return updatedChart;

            case 412:
                const serverChart = this.reconstituteFromDto(body);

                this.chart$.next(serverChart);

                throw new ConcurrencyConflictError(serverChart, originalChart!);

            default:
                console.error(body);
                throw new Error("Erro ao processar mutação no servidor.");
        }
    }

    private reconstituteFromDto(body: ChartOfAccountsDto): ChartOfAccountsEntity {
        const accountProps = body.accounts.map(fromDtoToProps);
        return ChartOfAccountsEntity.reconstitute(
            accountProps,
            VersionValue.create(body.version)
        );
    }

    private buildPatchOperations(events: AccountsEvents[]): CoaPatchOperation[] {
        return events.map<CoaPatchOperation | null>(event => {
            if (event instanceof AccountCreatedEvent) {
                const props = event.accountProps;
                return {
                    op: 'add',
                    path: `/accounts/${event.accountId}`,
                    value: {
                        name: props.name.value,
                        localIndex: props.structuralCode.localIndex,
                        parentId: props.parentId?.value ?? null,
                        description: props.description,
                        accountClass: props.accountClass,
                        isSummary: props.isSummary,
                        isContra: props.isContra,
                        isActive: props.isActive,
                    }
                };
            }

            if (event instanceof AccountUpdatedEvent) {
                const rawValue = event.newValue && event.newValue instanceof ValueObject
                    ? event.newValue.value
                    : event.newValue;

                return {
                    op: 'replace',
                    path: `/accounts/${event.accountId}/${event.attribute}`,
                    value: rawValue
                };
            }

            event satisfies never;
            throw new Error(`Evento não suportado para patch: ${event}`);
        }).filter((op): op is CoaPatchOperation => op !== null);
    }
}