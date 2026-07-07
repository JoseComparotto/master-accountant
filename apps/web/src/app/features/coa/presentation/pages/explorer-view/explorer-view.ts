import { Component, computed, inject, signal } from "@angular/core";
import { HlmBreadcrumbImports } from "@spartan-ng/helm/breadcrumb";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideHome } from "@ng-icons/lucide";
import { AccountTitle } from "../../components/account-title/account-title";
import { AccountEntity, StructuralCodeValue } from "@repo/coa-core";
import { CoaFacade } from "../../facades/coa.facade";
import { UuidValue } from "@repo/shared-core";
import { AccountClassTheme } from "../../directives/account-class-theme";
import { AccountActions } from "../../components/accounts-actions/account-actions";

@Component({
    selector: 'app-accounts-explorer',
    standalone: true,
    imports: [
    HlmBreadcrumbImports,
    AccountClassTheme,
    RouterLink,
    NgIcon,
    AccountTitle,
    AccountActions
],
    templateUrl: './explorer-view.html',
    viewProviders: [
        provideIcons({
            lucideHome
        })
    ]
})
export class ExplorerView {

    private readonly facade = inject(CoaFacade);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    protected readonly chart = this.facade.chart;

    protected readonly accountId = signal<UuidValue | null>(null);
    protected readonly account = computed<Readonly<AccountEntity> | null>(() => {
        const chart = this.chart();
        const accountId = this.accountId();
        if (!chart || !accountId) return null;

        const account = chart.findAccountById(accountId);
        if (account) {
            return account;
        } else {
            this.router.navigate(['/coa/explorer']);
            return null;
        }
    });

    protected readonly breadcrumbItems = computed<Readonly<AccountEntity>[]>(() => {
        const chart = this.chart();
        const account = this.account();
        if (!chart || !account) return [];

        const items: Readonly<AccountEntity>[] = [];

        let current = account;
        while (current!.parentId) {
            items.unshift(current);
            current = chart.getAccountById(current.parentId);
        }
        items.unshift(current);

        return items;
    });

    constructor() {
        this.route.url.subscribe(() => {
            try {
                const chart = this.chart();
                if (!chart) return;

                const accountIdRaw = this.route.snapshot.paramMap.get('id');
                const accountId = UuidValue.createOptional(accountIdRaw) ?? null;
                this.accountId.set(accountId);
            } catch {
                this.router.navigate(['/coa/explorer']);
            }
        })
    }

}
