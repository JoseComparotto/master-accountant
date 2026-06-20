import { Component, input, output } from '@angular/core';
import { ZardButtonComponent } from "@/shared/presentation/components/button";
import { NgIcon } from "@ng-icons/core";
import { AccountNodeDto } from '@repo/coa-contracts';

@Component({
  selector: 'app-toggle-account-active-button',
  imports: [ZardButtonComponent, NgIcon],
  templateUrl: './toggle-account-active-button.html',
  styleUrl: './toggle-account-active-button.css',
})
export class ToggleAccountActiveButton {

  account = input.required<AccountNodeDto>();

  toggle = output()

  canInactivate(): boolean {
    return !this.account().capabilities.canInactivate
  }
  canActivate(): boolean {
    return !this.account().capabilities.canActivate
  }
}
