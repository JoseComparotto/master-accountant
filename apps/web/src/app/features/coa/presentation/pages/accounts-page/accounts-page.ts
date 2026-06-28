import { Component, inject, OnInit, signal } from '@angular/core';
import { AccountsTable } from '../../components/accounts-table/accounts-table';
import { AccountNodeDto } from '@repo/coa-contracts';
import { COA_REPOSITORY } from '@/app.config';
import { from } from 'rxjs';
import { AccountEntity, AccountNameValue, ChartOfAccountsEntity } from '@repo/coa-core';
import { CoaFacade } from '../../facades/coa.facade';
import { UuidValue } from '@repo/shared-core';

@Component({
  selector: 'app-accounts-page',
  imports: [AccountsTable],
  templateUrl: './accounts-page.html',
  styleUrl: './accounts-page.css',
})
export class AccountsPage implements OnInit {

  protected facade = inject(CoaFacade);

  ngOnInit() {
    this.facade.load();
  }

  toggleActive(account: Readonly<AccountEntity>) {
    const chart = this.facade.chart();
    if (!chart) return;

    if (account.isActive)
      chart.inactivateAccount(account.id);
    else
      chart.activateAccount(account.id);

    this.facade.saveChanges(chart);
  }

  createChild(account: Readonly<AccountEntity>) {
    const chart = this.facade.chart();
    if (!chart) return;

    chart.createChildAccount({
      parentId: account.id,
      name:AccountNameValue.create('Conta Teste'),
      isSummary: false,
    })

    this.facade.saveChanges(chart);
  }
}
