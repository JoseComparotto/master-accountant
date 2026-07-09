import { Component, computed, HostListener, inject, input, model, output, signal, WritableSignal } from "@angular/core";
import { AccountEntity, ChartOfAccountsEntity } from "@repo/coa-core";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSearch } from "@ng-icons/lucide";
import { CoaFacade } from "../../facades/coa.facade";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";
import { HlmKbdImports } from "@spartan-ng/helm/kbd";
import { HlmCommandImports } from "@spartan-ng/helm/command";
import { AccountTitle } from "../account-title/account-title";
import { FormsModule, NgModel, ɵInternalFormsSharedModule } from "@angular/forms";
import { BrnCommandInput, CommandFilter } from "@spartan-ng/brain/command";
import { UuidValue } from "@repo/shared-core";

@Component({
    selector: 'app-account-search',
    imports: [
        HlmButtonImports,
        HlmInputImports,
        HlmInputGroupImports,
        HlmCommandImports,
        HlmKbdImports,
        BrnCommandInput,
        NgIcon,
        FormsModule,
        AccountTitle,
        ɵInternalFormsSharedModule
    ],
    templateUrl: './account-search.html',
    viewProviders: [
        provideIcons({
            lucideSearch
        })
    ]
})
export class AccountSearch {
    private readonly facade = inject(CoaFacade);
    protected readonly chart = this.facade.chart;

    protected readonly selected = signal<Readonly<AccountEntity> | null>(null);
    public readonly selectedChange = output<Readonly<AccountEntity>>();
    public readonly query = model('');
    public readonly state = signal<'closed' | 'open'>('closed');

    protected readonly options = computed<Readonly<AccountEntity>[]>(() => {
        return this.chart()?.accounts ?? []
    })
    public readonly normalizedQuery = computed(() =>
        this.normalize(this.query())
    )

    public readonly customFilter: CommandFilter = (value: string): boolean => {
        const chart = this.chart();
        const normalizedQuery = this.normalizedQuery();
        if (!chart || !normalizedQuery.length) return false;

        const accountId = UuidValue.safeParse(value);
        const account = accountId && chart.getAccountById(accountId);
        if (!account) return false;

        return this.normalize(account.name.value).includes(normalizedQuery) ||
            this.normalize(account.structuralCode.value).includes(normalizedQuery) ||
            (account.description !== null && this.normalize(account.description).includes(normalizedQuery))
    }

    @HostListener('document:keydown.control.k', ['$event'])
    protected onShortcut(event: Event) {
        event.preventDefault();
        this.stateChanged('open')
    }

    protected stateChanged(state: 'open' | 'closed') {
        this.state.set(state);
    }

    protected select(selected: Readonly<AccountEntity>) {
        this.state.set('closed');
        this.selected.set(selected);
        this.selectedChange.emit(selected);
        this.query.set('');
    }

    protected onFocused($event: FocusEvent) {
        const target = $event.target as HTMLInputElement;

        target.blur();
        this.stateChanged('open');
    }

    private normalize(query: string) {
        return query
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .replace(/\s+/g, " ").trim()
            .toLowerCase();
    }
}