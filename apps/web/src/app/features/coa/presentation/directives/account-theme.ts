import { computed, Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { AccountClassEnum } from '@repo/coa-core';
import { getAccountTheme, ThemeVariant } from '../constants/account-theme.constants';

@Directive({
  selector: '[appAccountTheme]',
  host: {
    '[class]': 'themeClasses()'
  }
})
export class AccountTheme {

  appAccountTheme = input.required<AccountClassEnum>();
  isContra = input<boolean>(false);
  variant = input.required<ThemeVariant>();

  protected themeClasses = computed(() => {
    const theme = getAccountTheme(this.appAccountTheme(), this.isContra());
    return theme[this.variant()];
  });

}
