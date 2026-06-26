import { ChartOfAccountsEntity } from '../entities/chart-of-accounts.entity.js';
import type { Observable } from 'rxjs'

export interface IChartOfAccountsRepository {

    getUnique(): Observable<ChartOfAccountsEntity>;

    save(chart: ChartOfAccountsEntity): Observable<void>;

}
