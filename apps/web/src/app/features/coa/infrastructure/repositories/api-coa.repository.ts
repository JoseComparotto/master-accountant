import { inject, Injectable } from "@angular/core";
import { AccountCreatedEvent, AccountDescriptionUpdated, AccountIsActiveUpdated, AccountIsContraUpdated, AccountNameUpdated, AccountProps, AccountUpdatedEvent, ChartOfAccountsCreatedEvent, ChartOfAccountsEntity, IChartOfAccountsRepository, VersionValue } from "@repo/coa-core";
import { CoaApiClient } from "../services/coa-api-client";
import { from, map, Observable, switchMap } from "rxjs";
import { fromDtoToProps } from "../../application/mappers/from-dto-to-props.mapper";
import { fromDomainToDto } from "../../application/mappers/from-props-to-dto.mapper";
import { PatchAccountInputDto, UpsertAccountInputDto } from "@repo/coa-contracts";

@Injectable()
export class ApiChartOfAccountsRepository implements IChartOfAccountsRepository {
    private readonly client = inject(CoaApiClient);

    getUnique(): Observable<ChartOfAccountsEntity> {
        return from(this.client.coa.get())
            .pipe(
                map(({ status, body }) => {
                    if (status === 200) {
                        const accountProps = body.accounts.map(fromDtoToProps)

                        return ChartOfAccountsEntity.reconstitute(
                            accountProps,
                            VersionValue.create(body.version)
                        );
                    }

                    console.error(body);
                    throw new Error("Erro ao buscar contas");
                })
            )
    }

    save(chart: ChartOfAccountsEntity): Observable<ChartOfAccountsEntity> {

        const events = chart.domainEvents;
        if (events.length === 0) return this.getUnique();
        chart.clearDomainEvents();

        const singleEvent = events.length === 1 ? events[0] : undefined;

        const updateAccountEvents = events.filter(e => e instanceof AccountUpdatedEvent);
        const updatedAccountIds = new Set(updateAccountEvents.map(e => e.accountId));
        const isPatchForSingleAccount =
            singleEvent instanceof AccountUpdatedEvent || // É redundante mas garante a exaustão de tipos.
            updatedAccountIds.size === 1 &&
            events.length === updateAccountEvents.length;

        if (isPatchForSingleAccount) {
            const [accountId] = updatedAccountIds;

            let patch: Partial<AccountProps> = {};

            for (const event of updateAccountEvents) {
                const { attribute, newValue } = event;
                patch = { ...patch, [attribute]: newValue };
                // Nota: Aqui não adianta tentar `patch[attribute]=newValue`...
            }

            return this.patchAccount(accountId, patch).pipe(
                switchMap(() => this.getUnique())
            );
        }

        // Se tiver mais de um evento a partir daqui, requer um PUT completo.
        if (!singleEvent) return this.putCoa(chart);

        if (singleEvent instanceof ChartOfAccountsCreatedEvent) {
            return this.putCoa(chart);
        }

        if (singleEvent instanceof AccountCreatedEvent) {
            return this.putAccount(
                singleEvent.accountId,
                {
                    ...singleEvent.accountProps,
                    name: singleEvent.accountProps.name.value,
                    localIndex: singleEvent.accountProps.structuralCode.localIndex,
                    parentId: singleEvent.accountProps.parentId?.value ?? null,
                }
            ).pipe(
                switchMap(() => this.getUnique())
            );
        }

        singleEvent satisfies never;
        console.error(singleEvent);
        throw new Error("Evento desconhecido");
    }

    private patchAccount(id: string, patch: Partial<AccountProps>): Observable<void> {

        const input: PatchAccountInputDto = {
            name: patch.name?.value,
            description: patch.description,
            isContra: patch.isContra,
            isActive: patch.isActive,
        };

        return from(this.client.accounts.patch({
            params: { id },
            body: input,
        })).pipe(
            map(({ status, body }) => {
                switch (status) {
                    case 200:
                        return;
                    default:
                        console.error(body);
                        throw new Error("Erro ao salvar conta");
                }
            })
        )
    }

    private putAccount(id: string, account: UpsertAccountInputDto): Observable<void> {
        return from(this.client.accounts.upsert({
            params: { id },
            body: account,
        })).pipe(
            map(({ status, body }) => {
                switch (status) {
                    case 200:
                        return;
                    default:
                        console.error(body);
                        throw new Error("Erro ao salvar conta");
                }
            })
        )
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
                        const accountProps = body.accounts.map(fromDtoToProps)

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
        )
    }
}

