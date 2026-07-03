import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronRight } from '@ng-icons/lucide';
import { AccountTitle } from '../account-title/account-title';
import { AccountEntity, ChartOfAccountsEntity } from '@repo/coa-core';
import { UuidValue } from '@repo/shared-core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AccountActions } from "./accounts-actions/account-actions";

@Component({
  selector: 'app-accounts-table',
  imports: [
    AccountTitle,
    NgClass, NgIcon,
    HlmTableImports,
    AccountActions
],
  templateUrl: './accounts-table.html',
  styleUrl: './accounts-table.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({
    lucideChevronDown,
    lucideChevronRight,
  })],
})
export class AccountsTable {
  chart = input.required<Readonly<ChartOfAccountsEntity>>();

  showInactive = model(true);
  collapsedIds = model<Set<string>>(new Set());

  rows = computed(() => {
    const chart = this.chart();

    const children = ({ id }: { id: UuidValue }) => {
      return chart.getAccountsByParentId(id)
        .sort((a, b) => a.localIndex - b.localIndex)
    }

    const rows: Readonly<AccountEntity>[] = [];
    const walk = (nodes: Readonly<AccountEntity>[]) => {
      for (const n of nodes) {
        if (!this.showInactive() && !n.isActive) continue;

        rows.push(n);

        if (!this.collapsedIds().has(n.id.value))
          walk(children(n));
      }
    };
    walk(chart.roots);
    return rows;
  });

  hasChildren(account: Readonly<AccountEntity>) {
    return this.chart().getAccountsByParentId(account.id).length > 0;
  }

  isCollepsed(id: UuidValue) {
    return this.collapsedIds().has(id.value);
  }

  toggleCollapsed(id: UuidValue) {
    this.collapsedIds.update(prev => {
      const next = new Set(prev);

      if (prev.has(id.value))
        next.delete(id.value);
      else
        next.add(id.value);

      return next;
    })
  }

}
