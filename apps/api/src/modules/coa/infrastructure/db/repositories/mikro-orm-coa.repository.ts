import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AccountNotExistsWithIdException, ChartOfAccountsEntity, IChartOfAccountsRepository, VersionValue } from '@repo/coa-core';
import { ChartOfAccountsOrmEntity } from '../entities/chart-of-accounts.orm-entity';
import { ChartOfAccountsMapper } from '../mappers/chart-of-accounts.mapper';
import { UuidValue } from '@repo/shared-core';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../../../config/configuration';

@Injectable()
export class MikroOrmChartOfAccountsRepository implements IChartOfAccountsRepository {

    private readonly chartId: UuidValue;

    constructor(
        private readonly em: EntityManager,
        configService: ConfigService<AppConfig>
    ) {
        const {defaultChartId} = configService.getOrThrow('mock', {infer:true});
        this.chartId = UuidValue.create(defaultChartId);
    }

    async getUnique(): Promise<ChartOfAccountsEntity> {
        const chart = await this.findById(this.chartId);
        if (!chart) throw new AccountNotExistsWithIdException(this.chartId.value);
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
        let ormEntity: ChartOfAccountsOrmEntity | null = await this.em.findOne(ChartOfAccountsOrmEntity, this.chartId.value, {
            populate: ['accounts'],
        });

        if (!ormEntity) {
            ormEntity = new ChartOfAccountsOrmEntity();
            ormEntity.id = this.chartId.value;
            this.em.persist(ormEntity);
        }

        ChartOfAccountsMapper.toPersistence(aggregate, ormEntity);
        await this.em.flush();
    }
}