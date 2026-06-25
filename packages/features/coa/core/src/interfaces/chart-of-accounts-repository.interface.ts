import { ChartOfAccountsEntity } from '../entities/chart-of-accounts.entity.js';

export interface IChartOfAccountsRepository {

    getUnique(): Promise<ChartOfAccountsEntity>;

    save(chart: ChartOfAccountsEntity): Promise<void>;

}
