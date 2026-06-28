import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { AccountDto, AccountNodeDto } from '@repo/coa-contracts';
import { ZardTableComponent, ZardTableHeaderComponent, ZardTableBodyComponent, ZardTableHeadComponent, ZardTableRowComponent, ZardTableCellComponent } from "@/shared/presentation/components/table";
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronRight, lucideCopy, lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/presentation/components/button';
import { AccountTitle } from '../account-title/account-title';
import { ToggleAccountActiveButton } from "../toggle-account-active-button/toggle-account-active-button";
import { AccountEntity, ChartOfAccountsEntity } from '@repo/coa-core';
import { UuidValue } from '@repo/shared-core';

type AccountCapabilities = {
  canActivate: boolean,
  canInactivate: boolean
}

@Component({
  selector: 'app-accounts-table',
  imports: [
    AccountTitle,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableHeadComponent,
    ZardTableRowComponent,
    ZardTableCellComponent,
    ZardButtonComponent,
    NgClass, NgIcon,
    ToggleAccountActiveButton
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
  chart = input.required<ChartOfAccountsEntity>();

  toggleActive = output<Readonly<AccountEntity>>();

  showInactive = model(true);
  collapsedIds = model<Set<string>>(new Set());

  rows = computed(() => {
    const chart = this.chart();

    const children = ({ id }: { id: UuidValue }) => {
      return chart.getAccountsByParentId(id)
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

  capabilities = computed(() => {
    const chart = this.chart();
    const map = new Map<string, AccountCapabilities>();
    for (const account of chart.accounts) {
      map.set(account.id.value, {
        canActivate: chart.canActivate(account.id),
        canInactivate: chart.canInactivate(account.id)
      })
    }
    return map;
  })

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

  canActivate(acocunt: { id: UuidValue }) {
    return this.capabilities().get(acocunt.id.value)?.canActivate === true;
  }

  canInactivate(acocunt: { id: UuidValue }) {
    return this.capabilities().get(acocunt.id.value)?.canInactivate === true;
  }
}
