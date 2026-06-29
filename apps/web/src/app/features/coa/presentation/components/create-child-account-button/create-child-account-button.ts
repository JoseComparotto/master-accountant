import { ZardButtonComponent } from '@/shared/presentation/components/button';
import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';

@Component({
  selector: 'app-create-child-account-button',
  imports: [ZardButtonComponent, NgIcon],
  templateUrl: './create-child-account-button.html',
  styleUrl: './create-child-account-button.css',
  viewProviders: [provideIcons({
    lucidePlus,
  })],
})
export class CreateChildAccountButton {

  canCreateChild = input<boolean>(false);

  create = output();

}
