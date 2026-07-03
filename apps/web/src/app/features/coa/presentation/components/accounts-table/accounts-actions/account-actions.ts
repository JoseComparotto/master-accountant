import { Component, inject, input } from '@angular/core';
import { AccountEntity } from '@repo/coa-core';
import { ToggleAccountActiveButton } from "../../toggle-account-active-button/toggle-account-active-button";
import { CoaFacade } from '../../../facades/coa.facade';
import { EditAccountButton } from "../../edit-account-button/edit-account-button";
import { CreateChildAccountButton } from "../../create-child-account-button/create-child-account-button";

@Component({
  selector: 'app-account-actions',
  standalone: true,
  imports: [ToggleAccountActiveButton, EditAccountButton, CreateChildAccountButton],
  templateUrl: './account-actions.html',
  host: {
    class: 'flex right-2  items-center justify-end gap-1'
  }
})
export class AccountActions {
  protected facade = inject(CoaFacade);

  account = input.required<Readonly<AccountEntity>>();

  canCreateChild() {
    const chart = this.facade.chart();
    const account = this.account();
    if (!chart) return false;
    return chart.canCreateChild(account.id);
  }

  canEdit() {
    const chart = this.facade.chart();
    const account = this.account();
    if (!chart) return false;
    return chart.canEdit(account.id);
  }

  canToggleActive() {
    const chart = this.facade.chart();
    const account = this.account();
    if (!chart) return false;
    return account.isActive ? chart.canInactivate(account.id) : chart.canActivate(account.id);
  }
}
