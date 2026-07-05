import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule } from "@angular/forms";

import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/brain/dialog";
import { AccountEntity, AccountNameValue } from "@repo/coa-core";
import { ValueObjectMalformedException } from "@repo/shared-core";
import { AccountTitle } from "../account-title/account-title";
import { HlmDialogImports, HlmDialogOptions } from "@spartan-ng/helm/dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";
import { HlmSwitchImports } from "@spartan-ng/helm/switch";

export type AccountFormDialogContext = 
  | { mode: 'edit'; account: Readonly<AccountEntity> }
  | { mode: 'create'; parent: Readonly<AccountEntity> };

interface AccountProps {
    name: AccountNameValue;
    description: string | null;
    isSummary: boolean;
    isContra: boolean;
}
export type AccountFormDialogResult = AccountProps;

@Component({
    selector: 'app-account-form-dialog',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        AccountTitle,
        HlmDialogImports,
        HlmButtonImports,
        HlmFieldImports,
        HlmInputImports,
        HlmInputGroupImports,
        HlmSwitchImports,
    ],
    templateUrl: './account-form-dialog.html',
    host:{
        class: 'block w-full'
    }
})
export class AccountFormDialog implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly ref = inject<BrnDialogRef<AccountFormDialogResult>>(BrnDialogRef);
    protected readonly context = injectBrnDialogContext<AccountFormDialogContext>();

    static defaultDialogOptions: Partial<HlmDialogOptions> = {
        contentClass: 'sm:max-w-lg w-lg min-w-[320px]'
    };

    protected form = this.fb.nonNullable.group({
        name: ['', [Validators.required, this.accountNameValidator()]],
        description: [''],
        isSummary: [false],
        isContra: [false]
    });

    ngOnInit(): void {
        if (this.context.mode === 'edit') {
            const { account } = this.context;
            this.form.patchValue({
                name: account.name.value,
                description: account.description ?? '',
                isSummary: account.isSummary,
                isContra: account.isContra,
            });
        } else {
            this.form.patchValue({
                name: '',
                description: '',
                isSummary: false,
                isContra: this.context.parent.isContra,
            });
        }
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { name, description, isSummary, isContra } = this.form.getRawValue();

        this.ref.close({
            name: AccountNameValue.create(name),
            description: this.cleanDescription(description),
            isSummary,
            isContra,
        });
    }

    private accountNameValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            try {
                AccountNameValue.create(control.value);
                return null;
            } catch (error: unknown) {
                if (error instanceof ValueObjectMalformedException) {
                    return { domainError: error.message };
                }
                // Evita estourar a pilha de renderização caso seja um erro inesperado
                return { domainError: 'Nome de conta inválido.' };
            }
        };
    }

    private cleanDescription(value: string): string | null {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }
}