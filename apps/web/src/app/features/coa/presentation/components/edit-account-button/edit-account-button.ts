import { Component, inject, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePencil } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { AccountEntity } from "@repo/coa-core";
import { CoaFacade } from "../../facades/coa.facade";
import { AccountFormDialog, AccountFormDialogContext, AccountFormDialogResult } from "../account-form-dialog/account-form-dialog";
import { ExpandOnGroupHoverDirective } from "@libs/ui/directives";
import { HlmDialogService } from "@spartan-ng/helm/dialog";

@Component({
    selector: 'app-edit-account-button',
    imports: [
        HlmButtonImports,
        ExpandOnGroupHoverDirective,
        NgIcon
    ],
    templateUrl: './edit-account-button.html',
    viewProviders: [
        provideIcons({
            lucidePencil
        })
    ],
})
export class EditAccountButton {
    private readonly hlmDialogService = inject(HlmDialogService);
    private facade = inject(CoaFacade);

    account = input.required<Readonly<AccountEntity>>();
    expansible = input<boolean>(false);

    openDialog() {
        this.hlmDialogService.open<AccountFormDialogContext, AccountFormDialogResult>(
            AccountFormDialog, {
            context: {
                mode: 'edit',
                account: this.account(),
                restrictions:{
                    canBeContra: this.canBeContra(),
                    canBeNormal: this.canBeNormal(),
                }
            },
        }).closed$.subscribe((result) => {
            if (result) this.edit(result);
        })
    }

    private edit(result: AccountFormDialogResult) {
        this.facade.editAccount({
            accountId: this.account().id,
            name: result.name,
            description: result.description,
            isContra: result.isContra,
        })
    }

    private canBeNormal(): boolean {
        const chart = this.facade.chart();
        return chart?.canConvertToNormal(this.account()) ?? false;
    }
    private canBeContra(): boolean {
        const chart = this.facade.chart();
        return chart?.canConvertToContra(this.account()) ?? false;
    }
}