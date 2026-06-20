import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[appAccountSummaryWeigth]',
  host: {
    '[class]': 'weigthClass()'
  }
})
export class AccountSummaryWeigth {

  appAccountSummaryWeigth = input.required<boolean>();

  protected weigthClass = computed(() => {
    return this.appAccountSummaryWeigth() ? 'font-semibold' : '';
  });
}
