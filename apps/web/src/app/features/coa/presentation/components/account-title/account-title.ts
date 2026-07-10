import { Component, input } from '@angular/core';
import { AccountClassTheme } from "../../directives/account-class-theme";
import { AccountSummaryWeigth } from "../../directives/account-summary-weigth";
import { AccountActiveEffect } from "../../directives/account-active-effect";
import { AccountEntity } from '@repo/coa-core';

@Component({
  selector: 'app-account-title',
  imports: [AccountClassTheme, AccountSummaryWeigth, AccountActiveEffect],
  templateUrl: './account-title.html',
  styleUrl: './account-title.css',
})
export class AccountTitle {
  account = input.required<Readonly<AccountEntity>>();
}
