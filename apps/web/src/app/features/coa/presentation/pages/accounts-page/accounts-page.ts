import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountsTable } from '../../components/accounts-table/accounts-table';
import { CoaFacade } from '../../facades/coa.facade';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'app-accounts-page',
  standalone: true,
	imports: [AccountsTable, HlmSpinnerImports],
	providers: [provideIcons({ lucideLoader })],
	changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accounts-page.html',
  styleUrl: './accounts-page.css',
})
export class AccountsPage implements OnInit {
  protected facade = inject(CoaFacade);

  ngOnInit() {
    this.facade.load();
  }

}
