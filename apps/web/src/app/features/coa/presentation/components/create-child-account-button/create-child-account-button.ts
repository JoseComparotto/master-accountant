import { ZardButtonComponent } from '@/shared/presentation/components/button';
import { ZardDialogService } from '@/shared/presentation/components/dialog';
import { Component, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { AccountEntity, AccountNameValue, canConvertToContra, canConvertToNormal } from '@repo/coa-core';
import {
  AccountFormDialog,
  AccountFormData,
  CreateAccountProps
} from '../account-form-dialog/account-form-dialog';
import { CoaFacade } from '../../facades/coa.facade';

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
  private facade = inject(CoaFacade);
  private dialogService = inject(ZardDialogService);

  account = input.required<Readonly<AccountEntity>>();
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
        isIndexUsed: this.isIndexUsedFn,
        canEditIsContra: this.canEditIsContraFn,
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

        return this.create({
          parent: account,
          props: {
            localIndex: formValue.isAutomaticCode ? undefined : formValue.localIndex!,
            name: formValue.name!,
            description: formValue.description!,
            isSummary: formValue.isSummary!,
            isContra: formValue.isContra!,
          }
        });
      },
      zWidth: '425px',
    });
  }

  private create({ parent, props: data }: CreateAccountData) {
    this.facade.createChildAccount({
      parentId: parent.id,
      localIndex: data.localIndex,
      name: AccountNameValue.create(data.name),
      description: data.description,
      isSummary: data.isSummary,
      isContra: data.isContra,
    });
  }

  protected canCreateChild() {
    const chart = this.facade.chart();
    const account = this.account();

    if (!chart) return false;

    return chart.canCreateChild(account.id);
  }

  private canEditIsContraFn: () => boolean= () => {
    return canConvertToNormal({
      isParentContra: this.account().isContra,
    }) && canConvertToContra({
      hasNormalChild: false, // It's a new Account
    })
  }

private isIndexUsedFn = (index: number): boolean => {
  const chart = this.facade.chart();
  const account = this.account();

  if (!chart) return false;

  return chart.getAccountsByParentId(account.id).some(a => a.localIndex === index);
}

  private nextIndex(): number {
    const chart = this.facade.chart();
    const account = this.account();

    if (!chart) return 1;

    return chart.getNextChildIndex(account.id);
  }
}
