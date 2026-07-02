import { COA_REPOSITORY } from "@/app.config";
import { inject, Injectable } from "@angular/core";
import { ChartOfAccountsEntity } from "@repo/coa-core";
import { UuidValue } from "@repo/shared-core";
import { map, Observable, switchMap, take } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ActivateAccountUseCase {

    private readonly repo = inject(COA_REPOSITORY);

    execute(accountId: UuidValue): Observable<void> {
        return this.repo.getUnique()
            .pipe(
                take(1),
                switchMap(chart => {
                    chart.activateAccount(accountId);
                    return this.repo.save(chart).pipe(map(() => undefined));
                })
            );
    }

}