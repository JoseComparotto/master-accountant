import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[appAccountActiveEffect]',
  host: {
    '[class]': 'inactiveClasses()'
  }
})
export class AccountActiveEffect {

  appAccountActiveEffect = input.required<boolean>();

  protected inactiveClasses = computed(() => {
    return this.appAccountActiveEffect() ? "" : "opacity-50 line-through";
  });
}
