import { Component, inject, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { AccountEntity } from "@repo/coa-core";
import { CoaFacade } from "../../facades/coa.facade";
import { AccountFormDialogContext, AccountFormDialogResult, AccountFormDialog } from "../account-form-dialog/account-form-dialog";
import { HlmDialogService } from "@spartan-ng/helm/dialog";
import { ExpandOnGroupHoverDirective } from "@libs/ui/directives";

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
                parent: this.account()
            },
            // contentClass: 'sm:max-w-lg w-lg min-w-[320px]',
        }).closed$.subscribe((result) => {
            if (result) this.createChild(result);
        })
    }

    private createChild(result: AccountFormDialogResult) {
        this.facade.createChildAccount({
            parentId: this.account().id,
            name: result.name,
            description: result.description,
            isContra: result.isContra,
            isSummary: result.isSummary,
        })
    }
}