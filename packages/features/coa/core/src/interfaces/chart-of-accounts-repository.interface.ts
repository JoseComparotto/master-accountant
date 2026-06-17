import { UuidValue } from '@repo/shared-core';
import { ChartOfAccountsEntity } from '../entities/chart-of-accounts.entity.js';

export interface IChartOfAccountsRepository {

    getById(id: UuidValue): Promise<ChartOfAccountsEntity>;

    save(chart: ChartOfAccountsEntity): Promise<void>;

}
