import { Component, inject, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { AccountEntity } from "@repo/coa-core";
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
        this.hlmDialogService.open<AccountFormDialogContext, AccountFormDialogResult>(
            AccountFormDialog, {
            context: {
                mode: 'create',
                parent: this.account(),
                checkIndexAvailability: this.checkIndexAvailabilityFn,
                nextAvailableIndex: this.nextAvailableIndex()
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
}