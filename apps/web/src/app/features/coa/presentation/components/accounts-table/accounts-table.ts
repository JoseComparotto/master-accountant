import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AccountDto } from '@repo/coa-contracts';
import { ZardTableComponent, ZardTableHeaderComponent, ZardTableBodyComponent, ZardTableHeadComponent, ZardTableRowComponent, ZardTableCellComponent } from "@/shared/presentation/components/table";
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideEye } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/presentation/components/button';
import { AccountTheme } from '../../directives/account-theme';
import { AccountTitle } from '../account-title/account-title';

@Component({
  selector: 'app-accounts-table',
  imports: [
    AccountTheme,
    AccountTitle,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableHeadComponent,
    ZardTableRowComponent,
    ZardTableCellComponent,
    ZardButtonComponent,
    NgClass, NgIcon
  ],
  templateUrl: './accounts-table.html',
  styleUrl: './accounts-table.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideCopy, lucideEye })],
})
export class AccountsTable {

  accounts = input.required<AccountDto[]>();

  getWeigthClass(isSummary: boolean): string {
    return isSummary ? 'font-semibold' : '';
  }
}
