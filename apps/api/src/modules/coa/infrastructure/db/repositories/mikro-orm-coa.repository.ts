import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ChartOfAccountsEntity, ChartOfAccountsNotExistsWithIdException, IChartOfAccountsRepository, VersionValue } from '@repo/coa-core';
import { ChartOfAccountsOrmEntity } from '../entities/chart-of-accounts.orm-entity';
import { ChartOfAccountsMapper } from '../mappers/chart-of-accounts.mapper';
import { UuidValue } from '@repo/shared-core';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../../../config/configuration';
import { from, map, Observable, switchMap } from 'rxjs'
import { throwIfNull } from '../../../../../shared/infrastructure/rx/operators';

@Injectable()
export class MikroOrmChartOfAccountsRepository implements IChartOfAccountsRepository {

    private readonly chartId: UuidValue;

    constructor(
        private readonly em: EntityManager,
        configService: ConfigService<AppConfig>
    ) {
        const { defaultChartId } = configService.getOrThrow('mock', { infer: true });
        this.chartId = UuidValue.create(defaultChartId);
    }

    getUnique(): Observable<ChartOfAccountsEntity> {
        return this.findById(this.chartId)
            .pipe(
                throwIfNull(() => new ChartOfAccountsNotExistsWithIdException(this.chartId.value))
            )
    }

    findById(id: UuidValue): Observable<ChartOfAccountsEntity | null> {

        const promise = this.em.findOne(ChartOfAccountsOrmEntity, id.value, {
            populate: ['accounts'],
        });

        return from(promise).pipe(
            map((ormEntity) => {
                if (!ormEntity)
                    return null;

                return ChartOfAccountsMapper.toDomain(ormEntity);
            })
        )
    }

    save(aggregate: ChartOfAccountsEntity): Observable<void> {
        return from(
            this.em.findOne(ChartOfAccountsOrmEntity, this.chartId.value, {
                populate: ['accounts'],
            })
        ).pipe(
            map((ormEntity) => {
                const entity = ormEntity ?? new ChartOfAccountsOrmEntity();

                if (!ormEntity)
                    entity.id = this.chartId.value;

                ChartOfAccountsMapper.toPersistence(aggregate, entity);

                this.em.persist(entity);

                return entity;
            }),
            switchMap(() => from(this.em.flush()))
        );
    }
}