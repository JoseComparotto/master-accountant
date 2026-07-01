import { COA_REPOSITORY } from "@/app.config";
import { inject, Injectable } from "@angular/core";
import { ChartOfAccountsEntity } from "@repo/coa-core";
import { UuidValue } from "@repo/shared-core";
import { map, Observable, switchMap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class InactivateAccountUseCase {

    private readonly repo = inject(COA_REPOSITORY);

    execute(accountId: UuidValue): Observable<void> {
        return this.repo.getUnique()
            .pipe(
                switchMap(chart => {
                    chart.inactivateAccount(accountId);
                    return this.repo.save(chart).pipe(map(() => undefined));
                })
            );
    }

}