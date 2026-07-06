import { computed, inject, Injectable, OnInit, signal } from '@angular/core';
import { ChartOfAccountsEntity, CreateChildAccountInput } from '@repo/coa-core';
import { GetChartOfAccountsUseCase } from '../../application/use-cases/get-coa.use-case';
import { ActivateAccountUseCase } from '../../application/use-cases/activate-account.use-case';
import { InactivateAccountUseCase } from '../../application/use-cases/inactivate-account.use-case';
import { EditAccountInput, EditAccountUseCase } from '../../application/use-cases/edit-account.use-case';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { UuidValue } from '@repo/shared-core';
import { RefreshChartOfAccountsUseCase } from '../../application/use-cases/refresh-coa.use-case';

interface ChartState {
  data: Readonly<ChartOfAccountsEntity> | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CoaFacade {
  private getChartUC = inject(GetChartOfAccountsUseCase);
  private refreshChartUC = inject(RefreshChartOfAccountsUseCase);
  private activateAccountUC = inject(ActivateAccountUseCase);
  private inactivateAccountUC = inject(InactivateAccountUseCase);
  private editAccountUC = inject(EditAccountUseCase);
  private createChildAccountUC = inject(CreateAccountUseCase);

  private state = signal<ChartState>({ data: null, loading: false, error: null });

  readonly chart = computed(() => this.state().data);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  load() {
    if (this.loading()) return;

    this.updateState({ loading: true, error: null });

    this.refreshChartUC.execute().subscribe({
      next: (aggregate) => this.updateState({ data: aggregate, loading: false }),
      error: (err) => this.updateState({ error: err.message, loading: false })
    });
  }

  activateAccount(id: UuidValue) {
    this.activateAccountUC.execute(id).subscribe({
      error: (err) => this.updateState({ error: err.message })
    });
  }

  inactivateAccount(id: UuidValue) {
    this.inactivateAccountUC.execute(id).subscribe({
      error: (err) => this.updateState({ error: err.message })
    });
  }

  createChildAccount(input: CreateChildAccountInput) {
    this.createChildAccountUC.execute(input).subscribe({
      error: (err) => this.updateState({ error: err.message })
    });
  }

  editAccount(input: EditAccountInput) {
    this.editAccountUC.execute(input).subscribe({
      error: (err) => this.updateState({ error: err.message })
    });
  }

  private updateState(patch: Partial<ChartState>): void {
    this.state.update(current => ({ ...current, ...patch }));
  }

}
