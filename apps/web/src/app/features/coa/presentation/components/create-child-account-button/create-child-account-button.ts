import { Component, inject, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { AccountEntity, canConvertToContra, canConvertToNormal } from "@repo/coa-core";
import { CoaFacade } from "../../facades/coa.facade";
import { AccountFormDialogContext, AccountFormDialogResult, AccountFormDialog, CodeAvailabilityState } from "../account-form-dialog/account-form-dialog";
import { HlmDialogService } from "@spartan-ng/helm/dialog";
import { ExpandOnGroupHoverDirective } from "@libs/ui/directives";
import { of } from "rxjs";

@Component({
    selector: 'app-create-child-account-button',
    imports: [
        HlmButtonImports,
        ExpandOnGroupHoverDirective,
        NgIcon
    ],
    templateUrl: './create-child-account-button.html',
    viewProviders: [
        provideIcons({
            lucidePlus
        })
    ],
})
export class CreateChildAccountButton {
    private readonly hlmDialogService = inject(HlmDialogService);
    private facade = inject(CoaFacade);

    account = input.required<Readonly<AccountEntity>>();

    openDialog() {
        const account = this.account();

        this.hlmDialogService.open<AccountFormDialogContext, AccountFormDialogResult>(
            AccountFormDialog, {
            context: {
                mode: 'create',
                parent: account,
                checkIndexAvailability: this.checkIndexAvailabilityFn,
                nextAvailableIndex: this.nextAvailableIndex(),
                restrictions: {
                    canBeNormal: this.canBeNormal(),
                    canBeContra: this.canBeContra(),
                }
            },
        }).closed$.subscribe((result) => {
            if (result) this.createChild(result);
        })
    }

    private createChild(result: AccountFormDialogResult) {
        this.facade.createChildAccount({
            parentId: this.account().id,
            localIndex: result.structuralCode.localIndex,
            name: result.name,
            description: result.description,
            isContra: result.isContra,
            isSummary: result.isSummary,
        })
    }

    private readonly checkIndexAvailabilityFn = (localIndex: number) => {

        const chart = this.facade.chart();
        const account = this.account();

        if (!chart) return of<CodeAvailabilityState>('invalid');

        return chart.hasAccountCode(account.structuralCode.createChild(localIndex)) ?
            of<CodeAvailabilityState>('taken') : of<CodeAvailabilityState>('available');
    }

    private nextAvailableIndex() {
        const chart = this.facade.chart();
        const account = this.account();

        if (!chart) return 1;

        return chart.getNextChildIndex(account.id);
    }

    private canBeNormal(): boolean{
        return canConvertToNormal({
            isParentContra: this.account().isContra
        });
    }
    private canBeContra(): boolean{
        return canConvertToContra({
            hasNormalChild: false // It's a new account
        })
    }
}