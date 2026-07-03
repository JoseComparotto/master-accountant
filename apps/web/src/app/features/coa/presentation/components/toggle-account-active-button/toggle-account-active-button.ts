import { Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { AccountEntity } from '@repo/coa-core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { CoaFacade } from '../../facades/coa.facade';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ExpandOnGroupHoverDirective } from '@libs/ui/directives/expand-on-group-hover.directive';

@Component({
  selector: 'app-toggle-account-active-button',
  imports: [
    HlmButtonImports,
    ExpandOnGroupHoverDirective,
    NgIcon
  ],
  templateUrl: './toggle-account-active-button.html',
  viewProviders: [provideIcons({
    lucideEye, lucideEyeOff
  })],
})
export class ToggleAccountActiveButton {
  protected facade = inject(CoaFacade);

  account = input.required<Readonly<AccountEntity>>();

  protected title = computed(() => {
    return this.account().isActive ? 'Inativar' : 'Ativar';
  });
  protected iconName = computed(() => {
    return this.account().isActive ? 'lucideEye' : 'lucideEyeOff';
  });

  toggle() {
    const account = this.account();
    if (account.isActive)
      this.facade.inactivateAccount(account.id);
    else
      this.facade.activateAccount(account.id);
  }
}
