import { Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePencil } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { AccountEntity } from "@repo/coa-core";
import { ExpandOnGroupHoverDirective } from "@libs/ui/directives/expand-on-group-hover.directive";

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

    account = input.required<Readonly<AccountEntity>>();

    edit() {
        console.log('Edit account');
    }
}