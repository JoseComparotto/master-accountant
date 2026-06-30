import { ZardButtonComponent } from '@/shared/presentation/components/button';
import { ZardDialogService } from '@/shared/presentation/components/dialog';
import { Component, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { AccountEntity, StructuralCodeValue } from '@repo/coa-core';
import {
  AccountFormDialog,
  AccountFormData,
  CreateAccountProps
} from '../account-form-dialog/account-form-dialog';

export interface CreateAccountData {
  parent: Readonly<AccountEntity>,
  props: CreateAccountProps,
}
@Component({
  selector: 'app-create-child-account-button',
  imports: [ZardButtonComponent, NgIcon],
  templateUrl: './create-child-account-button.html',
  styleUrl: './create-child-account-button.css',
  viewProviders: [provideIcons({
    lucidePlus,
  })],
})
export class CreateChildAccountButton {
  private dialogService = inject(ZardDialogService);

  account = input.required<Readonly<AccountEntity>>();
  nextIndex = input.required<number>();
  isIndexUsedFn = input.required<(index: number) => boolean>();

  // nextCode = input.required<StructuralCodeValue>()
  createChild = output<CreateAccountData>();
  canCreateChild = input<boolean>(false);

  openDialog() {
    const account = this.account();
    const accountDisplay = `${account.structuralCode}. ${account.name}`;

    this.dialogService.create({
      zTitle: 'Nova Conta',
      zDescription: `Será criada abaixo de ${accountDisplay}`,
      zContent: AccountFormDialog,
      zData: {
        mode: 'create',
        parentCode: account.structuralCode,
        isIndexUsed: this.isIndexUsedFn(),
        props: {
          localIndex: this.nextIndex(),
          name: '',
          description: '',
          isSummary: false,
          isContra: account.isContra,
        }
      } satisfies AccountFormData,
      zOkText: 'Criar Conta',
      zCancelText: 'Cancelar',
      zOnOk: instance => {
        // Força a validação visual caso o usuário clique sem preencher nada
        instance.form.markAllAsTouched();
        
        if (instance.form.invalid) {
          return false;
        }

        const formValue = instance.form.value;
        return this.submit({
          localIndex: formValue.isAutomaticCode ? undefined : formValue.localIndex!,
          name: formValue.name!,
          description: formValue.description!,
          isContra: formValue.isContra!,
          isSummary: formValue.isSummary!
        });
      },
      zWidth: '425px',
    });
  }

  private submit(data: CreateAccountData['props']) {
    return this.createChild.emit({
      parent: this.account(),
      props: data
    });
  }
}
