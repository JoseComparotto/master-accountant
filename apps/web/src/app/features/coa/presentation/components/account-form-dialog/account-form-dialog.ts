import { Z_MODAL_DATA } from '@/shared/presentation/components/dialog';
import { ZardFormImports } from '@/shared/presentation/components/form';
import { ZardInputDirective } from '@/shared/presentation/components/input';
import { ZardIdDirective } from '@/shared/presentation/core';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface AccountFormData {
  name: string,
  description: string,
  isSummary: boolean,
  isContra: boolean,
}

@Component({
  selector: 'app-account-form-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardIdDirective,
    ZardFormImports
  ],
  templateUrl: './account-form-dialog.html',
  styleUrl: './account-form-dialog.css',
})
export class AccountFormDialog {
  private data = inject<AccountFormData>(Z_MODAL_DATA);

  form = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    isContra: new FormControl(false),
    isSummary: new FormControl(true),
  });

  ngAfterViewInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }
}
