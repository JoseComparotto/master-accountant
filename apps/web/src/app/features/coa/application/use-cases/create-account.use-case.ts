import { COA_REPOSITORY } from "@/app.config";
import { inject, Injectable } from "@angular/core";
import { ChartOfAccountsEntity, CreateAccountInput } from "@repo/coa-core";
import { map, Observable, switchMap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CreateAccountUseCase {

    private readonly repo = inject(COA_REPOSITORY);

    execute(input: CreateAccountInput): Observable<void> {
        return this.repo.getUnique()
            .pipe(
                switchMap(chart => {
                    chart.createAccount(input);
                    return this.repo.save(chart).pipe(map(() => undefined));
                })
            );
    }

}