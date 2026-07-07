import { Component, inject, input, ViewChild, TemplateRef } from '@angular/core';
import { AccountEntity } from '@repo/coa-core';
import { ToggleAccountActiveButton } from "../toggle-account-active-button/toggle-account-active-button";
import { CoaFacade } from '../../facades/coa.facade';
import { EditAccountButton } from "../edit-account-button/edit-account-button";
import { CreateChildAccountButton } from "../create-child-account-button/create-child-account-button";
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoreHorizontal } from '@ng-icons/lucide';

@Component({
  selector: 'app-account-actions',
  standalone: true,
  exportAs: 'appAccountActions',
  imports: [
    ToggleAccountActiveButton, 
    EditAccountButton, 
    CreateChildAccountButton,
    HlmDropdownMenuImports,
    HlmButtonImports,
    NgIcon 
  ],
  templateUrl: './account-actions.html',
  host: {
    class: 'flex items-center justify-end gap-1'
  },
  viewProviders: [provideIcons({ lucideMoreHorizontal })]
})
export class AccountActions {
  protected facade = inject(CoaFacade);

  // Expõe o template para o acionador de contexto da tabela
  @ViewChild('dropdownTemplate', { static: true }) public dropdownTemplate!: TemplateRef<any>;

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