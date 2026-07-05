import type { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable, type TemplateRef } from '@angular/core';
import {
  type BrnDialogOptions,
  BrnDialogService,
  cssClassesToArray,
} from '@spartan-ng/brain/dialog';
import { HlmDialogContent } from './hlm-dialog-content';
import { hlmDialogOverlayClass } from './hlm-dialog-overlay';

export type HlmDialogOptions<DialogContext = unknown> = BrnDialogOptions & {
  contentClass?: string;
  showCloseButton?: boolean;
  context?: DialogContext;
};

@Injectable({
  providedIn: 'root',
})
export class HlmDialogService {
  private readonly _brnDialogService = inject(BrnDialogService);

  public open<DialogContex, DialogResult = unknown>(
    component: ComponentType<unknown> | TemplateRef<unknown>,
    options?: Partial<HlmDialogOptions<DialogContex>>,
  ) {

    const componentDefaultOptions: Partial<HlmDialogOptions<DialogContex>> =
      (component as any)['defaultDialogOptions'] || {};

    const optionsWithDefault = {
      ...componentDefaultOptions,
      ...(options ?? {})
    };

    const mergedOptions = {
      ...optionsWithDefault,
      backdropClass: cssClassesToArray(`${hlmDialogOverlayClass} ${optionsWithDefault?.backdropClass ?? ''}`),
      context: {
        ...(optionsWithDefault?.context && typeof optionsWithDefault.context === 'object' ? optionsWithDefault.context : {}),
        $component: component,
        $dynamicComponentClass: optionsWithDefault?.contentClass,
        $showCloseButton: optionsWithDefault?.showCloseButton,
      },
    };

    return this._brnDialogService.open<typeof mergedOptions.context, DialogResult>(
      HlmDialogContent,
      undefined,
      mergedOptions.context,
      mergedOptions,
    );
  }
}
