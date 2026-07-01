import { ChartOfAccountsEntity } from '../entities/chart-of-accounts.entity.js';
import type { Observable } from 'rxjs'
import { VersionValue } from '../value-objects/version.value.js';

export interface GetUniqueOptions {
    consistency?: 'strong' | 'eventual';
}

export interface IChartOfAccountsRepository {

    getUnique(options?: GetUniqueOptions): Observable<ChartOfAccountsEntity>;

    save(chart: ChartOfAccountsEntity, matchVersion?: VersionValue): Observable<ChartOfAccountsEntity>;

}
