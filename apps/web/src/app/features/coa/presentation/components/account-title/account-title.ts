import { Component, input } from '@angular/core';
import { AccountDto } from '@repo/coa-contracts';

@Component({
  selector: 'app-account-title',
  imports: [],
  templateUrl: './account-title.html',
  styleUrl: './account-title.css',
})
export class AccountTitle {

  account = input.required<AccountDto>();

}
