import { COA_REPOSITORY } from "@/app.config";
import { inject, Injectable } from "@angular/core";
import { AccountNameValue } from "@repo/coa-core";
import { UuidValue } from "@repo/shared-core";
import { map, Observable, switchMap, take } from "rxjs";

export interface EditAccountInput {
    accountId: UuidValue;

    name: AccountNameValue;
    description: string | null;
    isContra: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class EditAccountUseCase {

    private readonly repo = inject(COA_REPOSITORY);

    execute({ accountId, ...input }: EditAccountInput): Observable<void> {
        return this.repo.getUnique()
            .pipe(
                take(1),
                switchMap(chart => {

                    chart.updateAccountName(accountId, input.name);
                    chart.updateAccountDescription(accountId, input.description);

                    if (input.isContra)
                        chart.convertToContraAccount(accountId);
                    else
                        chart.convertToNormalAccount(accountId);

                    return this.repo.save(chart).pipe(map(() => undefined));
                })
            );
    }

}