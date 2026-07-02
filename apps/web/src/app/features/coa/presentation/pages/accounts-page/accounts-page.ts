import { Component, inject, OnInit } from '@angular/core';
import { AccountsTable } from '../../components/accounts-table/accounts-table';
import { CoaFacade } from '../../facades/coa.facade';
import { ZardLoaderComponent } from '@/shared/presentation/components/loader';

@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [AccountsTable, ZardLoaderComponent],
  templateUrl: './accounts-page.html',
  styleUrl: './accounts-page.css',
})
export class AccountsPage implements OnInit {
  protected facade = inject(CoaFacade);

  ngOnInit() {
    this.facade.load();
  }

}
