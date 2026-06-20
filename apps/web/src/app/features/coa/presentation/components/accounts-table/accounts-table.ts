import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { AccountDto, AccountNodeDto } from '@repo/coa-contracts';
import { ZardTableComponent, ZardTableHeaderComponent, ZardTableBodyComponent, ZardTableHeadComponent, ZardTableRowComponent, ZardTableCellComponent } from "@/shared/presentation/components/table";
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronRight, lucideCopy, lucideEye, lucideEyeOff } from '@ng-icons/lucide';
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
  viewProviders: [provideIcons({
    lucideChevronDown,
    lucideChevronRight,
    lucideEye, lucideEyeOff
  })],
})
export class AccountsTable {
  tree = input.required<AccountNodeDto[]>();

  toggleActive = output<AccountNodeDto>();

  showInactive = model(true);
  collapsedIds = model<Set<string>>(new Set());

  rows = computed(() => {
    const rows: AccountNodeDto[] = [];
    const walk = (nodes: AccountNodeDto[]) => {
      for (const n of nodes) {
        if (!this.showInactive() && !n.isActive) continue;
        rows.push(n);
        if (!this.collapsedIds().has(n.id) && n.children)
          walk(n.children);
      }
    };
    walk(this.tree());
    return rows;
  });

  getWeigthClass(isSummary: boolean): string {
    return isSummary ? 'font-semibold' : '';
  }

  hasChildren(account: AccountNodeDto) {
    return account.children && account.children?.length > 0;
  }

  isCollepsed(id: string) {
    return this.collapsedIds().has(id);
  }

  toggleCollapsed(id: string) {
    this.collapsedIds.update(prev => {
      const next = new Set(prev);

      if (prev.has(id))
        next.delete(id);
      else
        next.add(id);

      return next;
    })
  }

  canInactivate(account: AccountNodeDto): boolean {
    return !account.capabilities.canInactivate
  }
  canActivate(account: AccountNodeDto): boolean {
    return !account.capabilities.canActivate
  }
}
