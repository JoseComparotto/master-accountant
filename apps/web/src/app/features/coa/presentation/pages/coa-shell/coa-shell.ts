import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { IconType, NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLayoutGrid, lucideLoader, lucideRefreshCcw, lucideSheet } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { CoaFacade } from '../../facades/coa.facade';
import { CoaHeader } from '../../components/coa-header/coa-header';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmSwitch } from "@spartan-ng/helm/switch";
import { HlmLabel } from '@spartan-ng/helm/label';

type TabId = 'explorer' | 'spreadsheet';
type TabOptions = {
  route: TabId;
  label: string;
  icon: IconType;
}

@Component({
  selector: 'app-coa-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HlmSpinnerImports,
    HlmButtonImports,
    HlmTabsImports,
    CoaHeader,
    NgIcon,
    HlmSwitch,
    HlmLabel,
  ],
  templateUrl: './coa-shell.html',
  viewProviders: [
    provideIcons({
      lucideRefreshCcw,
      lucideLayoutGrid,
      lucideSheet,
      lucideLoader,
    })
  ],
})
export class CoaShell implements OnInit {
  protected facade = inject(CoaFacade);
  protected currentTab = signal<TabId>('spreadsheet');

  protected showInactive = this.facade.showInactive;
  protected hasInactive = this.facade.hasInactive;

  protected tabs: TabOptions[] = [
    {
      label: 'Explorador',
      route: 'explorer',
      icon: 'lucideLayoutGrid'
    },
    {
      label: 'Planilha',
      route: 'spreadsheet',
      icon: 'lucideSheet'
    },
  ];

  ngOnInit(): void {
    this.facade.load();
  }

  protected onTabChange(tab: TabId, active: boolean) {
    if (active) {
      this.currentTab.set(tab);
    }
  }
}
