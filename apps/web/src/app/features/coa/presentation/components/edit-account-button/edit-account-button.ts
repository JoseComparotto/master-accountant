import { Component, inject, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePencil } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { AccountEntity } from "@repo/coa-core";
import { ExpandOnGroupHoverDirective } from "@libs/ui/directives/expand-on-group-hover.directive";
import { HlmDialogService } from "@libs/ui/components/dialog/src";
import { AccontFormDialog, AccontFormDialogContext, AccontFormDialogResult } from "../account-form-dialog/account-form-dialog";
import { CoaFacade } from "../../facades/coa.facade";

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

    openDialog() {
        this.hlmDialogService.open<AccontFormDialogContext, AccontFormDialogResult>(
            AccontFormDialog, {
            context: {
                mode: 'edit',
                account: this.account()
            },
        }).closed$.subscribe((result) => {
            if (result) this.edit(result);
        })
    }

    private edit(result: AccontFormDialogResult) {
        this.facade.editAccount({
            accountId: this.account().id,
            name: result.name,
            description: result.description,
            isContra: result.isContra,
        })
    }
}