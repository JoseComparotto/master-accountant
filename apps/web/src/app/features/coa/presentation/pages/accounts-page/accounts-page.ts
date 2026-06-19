import { Component, inject, OnInit, signal } from '@angular/core';
import { AccountsTable } from '../../components/accounts-table/accounts-table';
import { AccountNodeDto } from '@repo/coa-contracts';
import { CoaApiClient } from '../../../infrastructure/coa-api-client';

@Component({
  selector: 'app-accounts-page',
  imports: [AccountsTable],
  templateUrl: './accounts-page.html',
  styleUrl: './accounts-page.css',
})
export class AccountsPage implements OnInit {

  private client = inject(CoaApiClient);

  protected loading = signal(false);
  protected accountsTree = signal<AccountNodeDto[]>([]);

  async ngOnInit() {
    await this.loadAccounts();
  }

  async loadAccounts() {
    this.loading.set(true);
    try {
      const { status, body } = await this.client.accounts.getTree();

      switch (status) {
        case 200:
          this.accountsTree.set(body)
          break;

        default:
          console.error(body);
          throw new Error("Não foi possivel buscar contas.");
      }

    } catch (e) {
      console.error("Erro ao buscar contas.");
      throw e;
    }
    finally {
      this.loading.set(false);
    }
  }

  async toggleActive(account: AccountNodeDto) {
    let promise;
    if (account.isActive)
      promise = this.client.accounts.inactivate({ params: { id: account.id } });
    else
      promise = this.client.accounts.activate({ params: { id: account.id } });

    const { status, body } = await promise;

    if (status === 200){
      this.loadAccounts();
      return;
    }
    if (status === 422) throw new Error(body.message);
    console.error("Erro inesperado: ", body);
    throw new Error("Erro inesperado ao anternar estado da conta.");
  }
}
