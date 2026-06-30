import { Component, inject, OnInit } from '@angular/core';
import { AccountsTable } from '../../components/accounts-table/accounts-table';
import { AccountEntity, AccountNameValue } from '@repo/coa-core';
import { CoaFacade } from '../../facades/coa.facade';
import { EditAccountData } from '../../components/edit-account-button/edit-account-button';
import { ZardLoaderComponent } from '@/shared/presentation/components/loader';
import { CreateAccountData } from '../../components/create-child-account-button/create-child-account-button';

@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [AccountsTable, ZardLoaderComponent],
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

  create({parent, props: data}: CreateAccountData) {
    const chart = this.facade.chart();
    if (!chart) return;

    chart.createChildAccount({
      parentId: parent.id,
      localIndex: data.localIndex,
      name: AccountNameValue.create(data.name),
      description: data.description,
      isSummary: data.isSummary,
      isContra: data.isContra,
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
