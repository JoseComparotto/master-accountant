import { Component, inject, input, output } from '@angular/core';
import { ZardButtonComponent } from "@/shared/presentation/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { AccountEntity } from '@repo/coa-core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { CoaFacade } from '../../facades/coa.facade';

@Component({
  selector: 'app-toggle-account-active-button',
  imports: [ZardButtonComponent, NgIcon],
  templateUrl: './toggle-account-active-button.html',
  styleUrl: './toggle-account-active-button.css',
  viewProviders: [provideIcons({
    lucideEye, lucideEyeOff
  })],
})
export class ToggleAccountActiveButton {
  protected facade = inject(CoaFacade);

  account = input.required<Readonly<AccountEntity>>();

  toggleActive() {
    const chart = this.facade.chart();
    if (!chart) return;
    const account = this.account();
    if (account.isActive)
      this.facade.inactivateAccount(account.id);
    else
      this.facade.activateAccount(account.id);
  }

  canActivate() {
    const chart = this.facade.chart();
    const account = this.account();
    if (!chart) return false;
    return chart.canActivate(account.id);
  }

  canInactivate() {
    const chart = this.facade.chart();
    const account = this.account();
    if (!chart) return false;
    return chart.canInactivate(account.id);
  }
}
