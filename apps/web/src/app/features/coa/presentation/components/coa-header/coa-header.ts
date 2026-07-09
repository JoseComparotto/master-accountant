import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideBookOpen } from '@ng-icons/lucide';
import { AccountSearch } from "../account-search/account-search";
import { AccountEntity } from '@repo/coa-core';
import { Router } from '@angular/router';

@Component({
  selector: 'header[app-coa-header]',
  imports: [NgIcon, AccountSearch],
  templateUrl: './coa-header.html',
  styleUrl: './coa-header.css',
  host: {
    class: 'flex items-start justify-between flex-wrap gap-4 mb-6'
  },
  viewProviders: [
    provideIcons({
      lucideBookOpen
    })
  ]
})
export class CoaHeader {
  private readonly router = inject(Router);
  
  protected redirectTo(account: Readonly<AccountEntity>) {
    this.router.navigate(['/coa/explorer', account.id.value]);
  }
}
