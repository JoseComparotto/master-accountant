import { Z_MODAL_DATA } from '@/shared/presentation/components/dialog';
import { ZardFormImports } from '@/shared/presentation/components/form';
import { ZardInputDirective } from '@/shared/presentation/components/input';
import { ZardSwitchComponent } from '@/shared/presentation/components/switch';
import { ZardIdDirective } from '@/shared/presentation/core';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { StructuralCodeValue } from '@repo/coa-core';

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
} | {
  mode: 'edit';
  props: EditAccountProps;
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
  protected data = inject<AccountFormData>(Z_MODAL_DATA);

  protected defaultIndex = signal<number | undefined>(undefined);
  protected isAutomatic = signal<boolean>(true);

  form = new FormGroup({
    isAutomaticCode: new FormControl<boolean>(true),
    localIndex: new FormControl<number | undefined>(
      { value: undefined, disabled: true },
      [this.accountCodeValidator()]
    ),
    name: new FormControl(''),
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

  /**
   * Validador customizado que utiliza a callback fornecida no inject data
   */
  private accountCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Se o controle não tiver valor ou se estivermos no modo de edição (onde isIndexUsed não existe), não valida
      if (control.value === null || control.value === undefined || this.data.mode !== 'create') {
        return null;
      }

      // Executa a callback passada por parâmetro no modal
      const isUsed = this.data.isIndexUsed(Number(control.value));

      // Se o código já estiver a ser usado, retorna o erro
      return isUsed ? { indexUsed: true } : null;
    };
  }
}
