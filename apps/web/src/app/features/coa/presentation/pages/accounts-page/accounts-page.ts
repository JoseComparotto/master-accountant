import { Component, inject, OnInit, signal } from '@angular/core';
import { AccountsTable } from '../../components/accounts-table/accounts-table';
import { AccountNodeDto } from '@repo/coa-contracts';
import { COA_REPOSITORY } from '@/app.config';
import { from } from 'rxjs';
import { AccountEntity, AccountNameValue, ChartOfAccountsEntity } from '@repo/coa-core';
import { CoaFacade } from '../../facades/coa.facade';
import { UuidValue } from '@repo/shared-core';
import { EditAccountData } from '../../components/edit-account-button/edit-account-button';

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
      name: AccountNameValue.create('Conta Teste'),
      isSummary: false,
    })

    this.facade.saveChanges(chart);
  }

  edit({ account, newData }: EditAccountData) {
    const chart = this.facade.chart();
    if (!chart) return;

    const accountId = account.id;
    const newName = AccountNameValue.create(newData.name);

    chart.updateAccountName(account.id, newName);
    chart.updateAccountDescription(accountId, newData.description);

    if (newData.isContra) chart.convertToContraAccount(accountId);
    else chart.convertToNormalAccount(accountId);

    this.facade.saveChanges(chart);
  }
}
