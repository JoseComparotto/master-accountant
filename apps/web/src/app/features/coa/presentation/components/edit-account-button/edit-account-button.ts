import { ZardButtonComponent } from '@/shared/presentation/components/button';
import { ZardDialogImports, ZardDialogService } from '@/shared/presentation/components/dialog';
import { Component, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { AccountFormData, AccountFormDialog } from '../account-form-dialog/account-form-dialog';
import { AccountEntity } from '@repo/coa-core';

export interface EditAccountData {
  account: Readonly<AccountEntity>,
  newData: AccountFormData
}

@Component({
  selector: 'app-edit-account-button',
  imports: [ZardDialogImports, ZardButtonComponent, NgIcon],
  templateUrl: './edit-account-button.html',
  styleUrl: './edit-account-button.css',
  viewProviders: [provideIcons({
    lucidePencil,
  })],
})
export class EditAccountButton {
  private dialogService = inject(ZardDialogService);

  account = input.required<Readonly<AccountEntity>>();
  edit = output<EditAccountData>();
  canEdit = input<boolean>();

  openDialog() {
    const account = this.account();
    const accountDisplay = `${account.structuralCode}. ${account.name}`;

    this.dialogService.create({
      zTitle: 'Editar Conta',
      zDescription: `Alterando ${accountDisplay}`,
      zContent: AccountFormDialog,
      zData: {
        name: account.name.value,
        description: account.description ?? '',
        isSummary: account.isSummary,
        isContra: account.isContra,
      } satisfies AccountFormData,
      zOkText: 'Salvar',
      zOnOk: instance => {
        this.submit(instance.form.value as AccountFormData);
      },
      zWidth: '425px',
    });
  }

  private submit(newData: EditAccountData['newData']) {
    return this.edit.emit({
      account: this.account(),
      newData
    });
  }

}
