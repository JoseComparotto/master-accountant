import { Component, computed, inject, signal } from "@angular/core";
import { HlmBreadcrumbImports } from "@spartan-ng/helm/breadcrumb";
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideHome } from "@ng-icons/lucide";
import { AccountTitle } from "../../components/account-title/account-title";
import { AccountEntity } from "@repo/coa-core";
import { CoaFacade } from "../../facades/coa.facade";
import { UuidValue } from "@repo/shared-core";
import { AccountClassTheme } from "../../directives/account-class-theme";
import { AccountActions } from "../../components/accounts-actions/account-actions";
import { AccountRootCard } from "../../components/account-root-card/account-root-card";
import { AccountChildCard } from "../../components/account-child-card/account-child-card";
import { AccountCopyLink } from "../../components/account-copy-link/account-copy-link";

@Component({
    selector: 'app-accounts-explorer',
    standalone: true,
    imports: [
    HlmBreadcrumbImports,
    HlmDropdownMenuImports,
    AccountClassTheme,
    RouterLink,
    NgIcon,
    AccountTitle,
    AccountActions,
    AccountRootCard,
    AccountChildCard,
    AccountCopyLink
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
    protected readonly showInactive = this.facade.showInactive;
    protected readonly roots = computed<Readonly<AccountEntity>[]>(() => {
        return this.chart()?.roots ?? [];
    });
    protected readonly patrimonialRoots = computed<Readonly<AccountEntity>[]>(() => {
        return this.chart()?.patrimonialRoots ?? [];
    });
    protected readonly resultRoots = computed<Readonly<AccountEntity>[]>(() => {
        return this.chart()?.resultRoots ?? [];
    });

    protected readonly accountId = signal<UuidValue | null>(null);
    protected readonly account = computed<Readonly<AccountEntity> | null>(() => {
        const chart = this.chart();
        const accountId = this.accountId();
        if (!chart || !accountId) return null;

        const account = chart.findAccountById(accountId);
        if (account) {
            return account;
        } else {
            this.navigateTo(null);
            return null;
        }
    });

    protected readonly breadcrumbItems = computed<Readonly<AccountEntity>[]>(() => {
        const chart = this.chart();
        const account = this.account();
        if (!chart || !account) return [];

        const items: Readonly<AccountEntity>[] = [
            account
        ];

        let currentId = account.parentId;
        while (currentId) {
            const current = chart.getAccountById(currentId);
            items.unshift(current);
            currentId = current.parentId
        }

        return items;
    });

    protected readonly children = computed(() => {
        const chart = this.chart();
        const accountId = this.accountId();
        if (!chart) return [];
        if (!accountId) return chart.roots;
        const children = chart.getAccountsByParentId(accountId);

        if (this.showInactive()) return children;
        return children.filter(c => c.isActive);
    })

    constructor() {
        this.route.url.subscribe(() => {
            try {
                const chart = this.chart();
                if (!chart) return;

                const accountIdRaw = this.route.snapshot.paramMap.get('id');
                const accountId = UuidValue.createOptional(accountIdRaw) ?? null;
                this.accountId.set(accountId);
            } catch {
                this.navigateTo(null);
            }
        })
    }

    protected navigateTo(account: Readonly<AccountEntity> | null) {
        const path = ['/coa/explorer'];
        if (account) path.push(account.id.value);
        this.router.navigate(path);
    }
}
