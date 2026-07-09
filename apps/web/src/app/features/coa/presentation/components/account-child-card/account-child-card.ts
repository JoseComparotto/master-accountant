import { Component, computed, inject, input, output } from "@angular/core";
import { AccountEntity } from "@repo/coa-core";
import { AccountClassTheme } from "../../directives/account-class-theme";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronRight, lucideFileText, lucideFolderTree } from "@ng-icons/lucide";
import { AccountTitle } from "../account-title/account-title";
import { NgClass } from "@angular/common";
import { CoaFacade } from "../../facades/coa.facade";

@Component({
    selector: 'app-account-child-card',
    imports: [
        AccountClassTheme,
        NgIcon,
        AccountTitle,
        NgClass
    ],
    templateUrl: './account-child-card.html',
    viewProviders: [
        provideIcons({
            lucideFolderTree,
            lucideFileText,
            lucideChevronRight
        })
    ]
})
export class AccountChildCard {
    private readonly facade = inject(CoaFacade);
    private readonly chart = this.facade.chart;
    private readonly showInactive = this.facade.showInactive;

    account = input.required<Readonly<AccountEntity>>();
    click = output();

    protected readonly childrenCount = computed(()=> {
        const chart = this.chart();
        const account = this.account();
        const children = chart?.getAccountsByParentId(account.id)??[];

        if(this.showInactive())return children.length;
        return children.filter(c=>c.isActive).length;
    });
}