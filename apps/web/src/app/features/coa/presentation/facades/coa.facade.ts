import { computed, inject, Injectable, signal } from '@angular/core';
import { ChartOfAccountsEntity } from '@repo/coa-core';
import { BehaviorSubject, finalize, map } from 'rxjs';
import { GetChartOfAccountsUseCase } from '../../application/use-cases/get-coa.use-case';
import { SaveChartOfAccountsUseCase } from '../../application/use-cases/save-coa.use-case';

interface ChartState {
    data: ChartOfAccountsEntity | null;
    loading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class CoaFacade {
    private getChartUC = inject(GetChartOfAccountsUseCase);
    private saveChartUC = inject(SaveChartOfAccountsUseCase);

    private state = signal<ChartState>({ data: null, loading: false, error: null });

    readonly chart = computed(() => this.state().data);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);

    public load(): void {
        if (this.loading()) return;
        
        this.updateState({ loading: true, error: null });

        this.getChartUC.execute().subscribe({
            next: (aggregate) => this.updateState({ data: aggregate, loading: false }),
            error: (err) => this.updateState({ error: err.message, loading: false })
        });
    }

    public saveChanges(chart: ChartOfAccountsEntity) {
        if (this.loading()) return;

        this.saveChartUC.execute(chart)
            .subscribe((updated) => {
                this.updateState({ data: updated })
            })
    }

    private updateState(patch: Partial<ChartState>): void {
        this.state.update(current => ({ ...current, ...patch }));
    }

}
