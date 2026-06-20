import { computed, Directive, input } from '@angular/core';
import { AccountClassEnum } from '@repo/coa-core';
import { getAccountTheme, ThemeVariant } from '../constants/account-theme.constants';

@Directive({
  selector: '[appAccountClassTheme]',
  host: {
    '[class]': 'themeClasses()'
  }
})
export class AccountClassTheme {

  appAccountClassTheme = input.required<AccountClassEnum>();
  variant = input.required<ThemeVariant>();
  isContra = input<boolean>(false);

  protected themeClasses = computed(() => {
    const theme = getAccountTheme(this.appAccountClassTheme(), this.isContra());
    return theme[this.variant()];
  });

}
