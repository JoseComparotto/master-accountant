import { booleanAttribute, computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[appExpandOnGroupHover]',
  standalone: true,
  host: {
    '[class]': 'tailwindClasses()'
  }
})
export class ExpandOnGroupHoverDirective {
  readonly appExpandOnGroupHover = input<boolean, unknown>(true, { 
    transform: booleanAttribute 
  });

  readonly tailwindClasses = computed(() => {
    if (!this.appExpandOnGroupHover()) {
      return '';
    }
    
    return 'inline-block max-w-0 opacity-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2';
  });
}