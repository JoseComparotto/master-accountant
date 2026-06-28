import { COA_REPOSITORY } from "@/app.config";
import { inject, Injectable } from "@angular/core";
import { ChartOfAccountsEntity } from "@repo/coa-core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SaveChartOfAccountsUseCase{

    private readonly repo = inject(COA_REPOSITORY);

    execute(chart: ChartOfAccountsEntity): Observable<ChartOfAccountsEntity>{
        return this.repo.save(chart);
    }

}