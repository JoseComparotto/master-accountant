import { Z_MODAL_DATA } from '@/shared/presentation/components/dialog';
import { ZardFormImports } from '@/shared/presentation/components/form';
import { ZardInputDirective } from '@/shared/presentation/components/input';
import { ZardSwitchComponent } from '@/shared/presentation/components/switch';
import { ZardIdDirective } from '@/shared/presentation/core';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { StructuralCodeValue, AccountNameValue } from '@repo/coa-core';
import { ValueObjectMalformedException } from '@repo/shared-core';

export interface CreateAccountProps {
  localIndex?: number;
  name: string;
  description: string;
  isSummary: boolean;
  isContra: boolean;
}
export interface EditAccountProps {
  name: string;
  description: string;
  isContra: boolean;
}

export type AccountFormData = {
  mode: 'create';
  props: CreateAccountProps;
  parentCode: StructuralCodeValue;
  isIndexUsed: (index: number) => boolean;
  canEditIsContra: () => boolean;
} | {
  mode: 'edit';
  props: EditAccountProps;
  canEditIsContra: () => boolean;
}

@Component({
  selector: 'app-account-form-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZardSwitchComponent,
    ZardInputDirective,
    ZardIdDirective,
    ZardFormImports
  ],
  templateUrl: './account-form-dialog.html',
  styleUrl: './account-form-dialog.css',
})
export class AccountFormDialog implements OnInit {
  protected readonly data = inject<AccountFormData>(Z_MODAL_DATA);

  protected defaultIndex = signal<number | undefined>(undefined);
  protected isAutomatic = signal<boolean>(true);

  readonly form = new FormGroup({
    isAutomaticCode: new FormControl(true),
    localIndex: new FormControl<number | undefined>({
      value: undefined,
      disabled: true
    }, {
      validators: [Validators.required, this.accountCodeValidator()]
    }),
    name: new FormControl('', {
      validators: [Validators.required, this.accountNameValidator()]
    }),
    description: new FormControl(''),
    isContra: new FormControl(false),
    isSummary: new FormControl(true),
  });

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data.props);

      if (this.data.mode === 'create') {
        this.defaultIndex.set(this.data.props.localIndex);
        this.form.get('localIndex')?.setValue(this.data.props.localIndex);
      }

      if (!this.data.canEditIsContra()) {
        this.form.get('isContra')?.disable();
      }
    }

    this.form.get('isAutomaticCode')?.valueChanges.subscribe((isAuto) => {
      this.isAutomatic.set(Boolean(isAuto));
      const localIndexControl = this.form.get('localIndex');

      if (isAuto) {
        localIndexControl?.disable();
        localIndexControl?.setValue(this.defaultIndex());
      } else {
        localIndexControl?.enable();
        localIndexControl?.updateValueAndValidity();
      }
    });
  }

  private accountNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      try {
        AccountNameValue.create(control.value);
        return null;
      } catch (error: any) {
        if (error instanceof ValueObjectMalformedException)
          return { domainError: error.message };
        throw error;
      }
    };
  }

  private accountCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || this.data.mode !== 'create') {
        return null;
      }
      const isUsed = this.data.isIndexUsed(Number(control.value));
      return isUsed ? { indexUsed: true } : null;
    };
  }
}