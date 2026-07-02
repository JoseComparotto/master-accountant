import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { ZardTableComponent, ZardTableHeaderComponent, ZardTableBodyComponent, ZardTableHeadComponent, ZardTableRowComponent, ZardTableCellComponent } from "@/shared/presentation/components/table";
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronRight, lucideCopy, lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/presentation/components/button';
import { AccountTitle } from '../account-title/account-title';
import { ToggleAccountActiveButton } from "../toggle-account-active-button/toggle-account-active-button";
import { AccountEntity, ChartOfAccountsEntity } from '@repo/coa-core';
import { UuidValue } from '@repo/shared-core';
import { CreateChildAccountButton } from "../create-child-account-button/create-child-account-button";
import { EditAccountButton, EditAccountData } from "../edit-account-button/edit-account-button";

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
    ToggleAccountActiveButton,
    CreateChildAccountButton,
    EditAccountButton
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
