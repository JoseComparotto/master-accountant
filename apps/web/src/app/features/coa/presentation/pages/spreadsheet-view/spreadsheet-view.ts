import { Component, computed, inject, input, model } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronRight } from '@ng-icons/lucide';
import { AccountTitle } from '../../components/account-title/account-title';
import { AccountEntity, ChartOfAccountsEntity } from '@repo/coa-core';
import { UuidValue } from '@repo/shared-core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AccountActions } from "../../components/accounts-actions/account-actions";
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CoaFacade } from '../../facades/coa.facade';
import { Router } from "@angular/router";

@Component({
  selector: 'app-coa-spreadsheet',
  imports: [
    AccountTitle,
    NgClass, NgIcon,
    HlmTableImports,
    HlmContextMenuImports,
    HlmScrollAreaImports,
    NgScrollbarModule,
    AccountActions,
  ],
  templateUrl: './spreadsheet-view.html',
  styleUrl: './spreadsheet-view.css',
  host: {
    class: 'block h-full w-full min-h-0'
  },
  viewProviders: [provideIcons({
    lucideChevronDown,
    lucideChevronRight,
  })],
})
export class SpreadsheetView {
  private readonly facade = inject(CoaFacade);
  private readonly router = inject(Router);
  private readonly chart = this.facade.chart;

  showInactive = model(true);
  collapsedIds = model<Set<string>>(new Set());

  rows = computed(() => {
    const chart = this.chart();
    if (!chart) return [];

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
    const chart = this.chart();
    if (!chart) return false;
    return chart.getAccountsByParentId(account.id).length > 0;
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

  onRowClick(event: MouseEvent, row: Readonly<AccountEntity>) {
    const target = event.target as HTMLElement;

    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    this.router.navigate(['/coa/explorer', row.id.value])
  }

}
