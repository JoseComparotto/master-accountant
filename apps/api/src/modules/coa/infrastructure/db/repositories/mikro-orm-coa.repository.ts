import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AccountNotExistsWithIdException, ChartOfAccountsEntity, IChartOfAccountsRepository, VersionValue } from '@repo/coa-core';
import { ChartOfAccountsOrmEntity } from '../entities/chart-of-accounts.orm-entity';
import { ChartOfAccountsMapper } from '../mappers/chart-of-accounts.mapper';
import { UuidValue } from '@repo/shared-core';

@Injectable()
export class MikroOrmChartOfAccountsRepository implements IChartOfAccountsRepository {
    constructor(
        private readonly em: EntityManager
    ) { }

    async getById(id: UuidValue): Promise<ChartOfAccountsEntity> {
        const chart = await this.findById(id);
        if (!chart) throw new AccountNotExistsWithIdException(id.value);
        return chart;
    }

    async findById(id: UuidValue): Promise<ChartOfAccountsEntity | null> {
        const ormEntity = await this.em.findOne(ChartOfAccountsOrmEntity, id.value, {
            populate: ['accounts'],
        });

        if (!ormEntity) return null;

        return ChartOfAccountsMapper.toDomain(ormEntity);
    }

    async save(aggregate: ChartOfAccountsEntity): Promise<void> {
        let ormEntity: ChartOfAccountsOrmEntity | null = await this.em.findOne(ChartOfAccountsOrmEntity, aggregate.id.value, {
            populate: ['accounts'],
        });

        if (!ormEntity) {
            ormEntity = new ChartOfAccountsOrmEntity();
            ormEntity.id = aggregate.id.value;
            this.em.persist(ormEntity);
        }

        ChartOfAccountsMapper.toPersistence(aggregate, ormEntity);
        await this.em.flush();
    }
}