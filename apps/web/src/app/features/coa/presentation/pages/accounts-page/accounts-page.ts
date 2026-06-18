import { Component, inject, OnInit, signal } from '@angular/core';
import { AccountsTable } from '../../components/accounts-table/accounts-table';
import { AccountDto } from '@repo/coa-contracts';
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
  protected accounts = signal<AccountDto[]>([]);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const { status, body } = await this.client.accounts.getAll();

      switch (status) {
        case 200:
          this.accounts.set(body)
          break;

        default:
          console.error(body);
          throw new Error("Não foi possivel buscar contas.");
      }

    } catch (e){
      console.error("Erro ao buscar contas.");
      throw e;
    }
    finally {
      this.loading.set(false);
    }
  }
}
