import { COA_REPOSITORY } from "@/app.config";
import { inject, Injectable } from "@angular/core";
import { ChartOfAccountsEntity } from "@repo/coa-core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class GetChartOfAccountsUseCase{

    private readonly repo = inject(COA_REPOSITORY);

    execute(): Observable<ChartOfAccountsEntity>{
        return this.repo.getUnique()
    }

}