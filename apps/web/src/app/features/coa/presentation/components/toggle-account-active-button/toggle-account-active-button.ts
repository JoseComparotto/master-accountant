import { Component, input, output } from '@angular/core';
import { ZardButtonComponent } from "@/shared/presentation/components/button";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { AccountEntity } from '@repo/coa-core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';

@Component({
  selector: 'app-toggle-account-active-button',
  imports: [ZardButtonComponent, NgIcon],
  templateUrl: './toggle-account-active-button.html',
  styleUrl: './toggle-account-active-button.css',
  viewProviders: [provideIcons({
    lucideEye, lucideEyeOff
  })],
})
export class ToggleAccountActiveButton {

  account = input.required<Readonly<AccountEntity>>();

  toggle = output()

  canInactivate = input<boolean>(false);
  canActivate = input<boolean>(false);
}
