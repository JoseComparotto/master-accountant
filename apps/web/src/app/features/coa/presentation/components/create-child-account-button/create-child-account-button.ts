import { Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { AccountEntity } from "@repo/coa-core";
import { ExpandOnGroupHoverDirective } from "@libs/ui/directives/expand-on-group-hover.directive";

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

    account = input.required<Readonly<AccountEntity>>();

    createChild() {
        console.log('Create child account');
    }
}