import { Component, input } from '@angular/core';
import { AccountDto } from '@repo/coa-contracts';

@Component({
  selector: 'app-accounts-table',
  imports: [],
  templateUrl: './accounts-table.html',
  styleUrl: './accounts-table.css',
})
export class AccountsTable {
  accounts = input.required<AccountDto[]>();
}
