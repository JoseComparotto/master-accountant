import { Component, computed, input, output } from "@angular/core";
import { AccountClassEnum, AccountEntity } from "@repo/coa-core";
import { AccountClassTheme } from "../../directives/account-class-theme";
import { IconName, NgIcon, provideIcons } from "@ng-icons/core";
import { getAccountTheme } from "../../constants/account-theme.constants";
import { lucideMinus, lucidePlus, lucideScale, lucideTrendingDown, lucideTrendingUp } from "@ng-icons/lucide";

@Component({
    selector: 'app-account-root-card',
    imports: [
        AccountClassTheme,
        NgIcon
    ],
    templateUrl: './account-root-card.html',
    viewProviders: [
        provideIcons({
            lucidePlus,
            lucideMinus,
            lucideScale,
            lucideTrendingUp,
            lucideTrendingDown,
        })
    ]
})
export class AccountRootCard {
    readonly account = input.required<Readonly<AccountEntity>>();
    readonly variant = input<'card' | 'row'>('card');

    readonly accountTheme = computed(() => {
        const account = this.account();
        return getAccountTheme(account.accountClass, account.isContra);
    })

    readonly label = computed(() => {
        const account = this.account();
        const theme = getAccountTheme(account.accountClass, account.isContra);
        return theme.label;
    });

    readonly iconName = computed<IconName>(() => {
        const { accountClass } = this.account();
        switch (accountClass) {
            case AccountClassEnum.ASSET:        return 'lucidePlus';
            case AccountClassEnum.LIABILITY:    return 'lucideMinus';
            case AccountClassEnum.EQUITY:       return 'lucideScale';
            case AccountClassEnum.INCOME:       return 'lucideTrendingUp';
            case AccountClassEnum.EXPENSE:      return 'lucideTrendingDown';

            default:
                accountClass satisfies never;
                throw new Error('Invalid accoutn class: '+ accountClass);
        }
    });

    readonly click = output();
}