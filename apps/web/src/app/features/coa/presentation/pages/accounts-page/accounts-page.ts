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
      this.facade.inactivateAccount(account.id);
    else
      this.facade.activateAccount(account.id);
  }

  create({parent, props: data}: CreateAccountData) {
    this.facade.createChildAccount({
      parentId: parent.id,
      localIndex: data.localIndex,
      name: AccountNameValue.create(data.name),
      description: data.description,
      isSummary: data.isSummary,
      isContra: data.isContra,
    });
  }

  edit({ account, newData }: EditAccountData) {
    this.facade.editAccount({
      accountId: account.id,
      name: AccountNameValue.create(newData.name),
      description: newData.description,
      isContra: newData.isContra,
    });
  }
}
