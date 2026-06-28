import { Component, input, output } from '@angular/core';
import { ZardButtonComponent } from "@/shared/presentation/components/button";
import { NgIcon } from "@ng-icons/core";
import { AccountEntity, ChartOfAccountsEntity } from '@repo/coa-core';

@Component({
  selector: 'app-toggle-account-active-button',
  imports: [ZardButtonComponent, NgIcon],
  templateUrl: './toggle-account-active-button.html',
  styleUrl: './toggle-account-active-button.css',
})
export class ToggleAccountActiveButton {

  account = input.required<Readonly<AccountEntity>>();

  toggle = output()

  canInactivate = input<boolean>(false);
  canActivate = input<boolean>(false);
}
