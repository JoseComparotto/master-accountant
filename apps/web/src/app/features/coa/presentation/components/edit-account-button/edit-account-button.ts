import { ZardButtonComponent } from '@/shared/presentation/components/button';
import { ZardDialogImports, ZardDialogService } from '@/shared/presentation/components/dialog';
import { Component, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { AccountFormData, AccountFormDialog, EditAccountProps } from '../account-form-dialog/account-form-dialog';
import { AccountEntity, AccountNameValue } from '@repo/coa-core';
import { CoaFacade } from '../../facades/coa.facade';

export interface EditAccountData {
  account: Readonly<AccountEntity>,
  newData: EditAccountProps,
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
  private facade = inject(CoaFacade);
  private dialogService = inject(ZardDialogService);

  account = input.required<Readonly<AccountEntity>>();

  openDialog() {
    const account = this.account();
    const accountDisplay = `${account.structuralCode}. ${account.name}`;

    this.dialogService.create({
      zTitle: 'Editar Conta',
      zDescription: `Alterando ${accountDisplay}`,
      zContent: AccountFormDialog,
      zData: {
        mode: 'edit',
        canEditIsContra: () => this.canEditIsContra(),
        props: {
          name: account.name.value,
          description: account.description ?? '',
          isContra: account.isContra,
        }
      } satisfies AccountFormData,
      zOkText: 'Salvar',
      zCancelText: 'Cancelar',
      zOnOk: instance => {
        instance.form.markAllAsTouched();

        if (instance.form.invalid) return false;

        return this.edit(instance.form.value as EditAccountProps);
      },
      zWidth: '425px',
    });
  }

  private edit(newData: EditAccountProps) {
    const account = this.account();

    this.facade.editAccount({
      accountId: this.account().id,
      name: AccountNameValue.create(newData.name),
      description: newData.description,
      isContra: newData.isContra ?? account.isContra,
    });
  }

  private canEditIsContra() {
    const chart = this.facade.chart();
    const account = this.account();

    if (!chart) return false;

    return account.isContra ?
      chart.canConvertToNormal(account.id) :
      chart.canConvertToContra(account.id);
  }

  protected canEdit(){
    return this.facade.chart()?.canEdit(this.account().id) ?? false;
  }
}
