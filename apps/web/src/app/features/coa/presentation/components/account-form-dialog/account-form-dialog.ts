import { Component, inject, OnInit, signal, DestroyRef } from "@angular/core";
import { FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/brain/dialog";
import { AccountEntity, AccountNameValue, StructuralCodeValue } from "@repo/coa-core";
import { ValueObjectMalformedException } from "@repo/shared-core";
import { AccountTitle } from "../account-title/account-title";
import { HlmDialogImports, HlmDialogOptions } from "@spartan-ng/helm/dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";
import { HlmSwitchImports } from "@spartan-ng/helm/switch";
import { HlmTooltipImports } from "@spartan-ng/helm/tooltip";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLoader2, lucideCheck, lucideX, lucideAlertCircle } from "@ng-icons/lucide";
import { debounceTime, Observable, of, switchMap, tap } from "rxjs";

export type CodeAvailabilityState = 'invalid' | 'checking' | 'available' | 'taken';

export type AccountFormDialogContext =
    | { mode: 'edit'; account: Readonly<AccountEntity> }
    | {
        mode: 'create';
        parent: Readonly<AccountEntity>;
        checkIndexAvailability: (localIndex: number) => Observable<CodeAvailabilityState>;
        nextAvailableIndex: number
    };

interface AccountProps {
    structuralCode: StructuralCodeValue;
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
        HlmTooltipImports,
        NgIcon
    ],
    templateUrl: './account-form-dialog.html',
    host: {
        class: 'block w-full'
    },
    viewProviders: [
        provideIcons({
            lucideLoader2, lucideCheck, lucideX, lucideAlertCircle 
        })
    ],
})
export class AccountFormDialog implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly ref = inject<BrnDialogRef<AccountFormDialogResult>>(BrnDialogRef);
    private readonly destroyRef = inject(DestroyRef);
    protected readonly context = injectBrnDialogContext<AccountFormDialogContext>();

    static defaultDialogOptions: Partial<HlmDialogOptions> = {
        contentClass: 'sm:max-w-lg w-lg min-w-[320px]'
    };

    protected readonly form = this.fb.nonNullable.group({
        localIndex: [1, [Validators.required, this.domainValidator(v => this.buildStructuralCode(v), 'Código inválido.')]],
        name: ['', [Validators.required, this.domainValidator(v => this.buildName(v), 'Nome de conta inválido.')]],
        description: [''],
        isSummary: [false],
        isContra: [false]
    });

    protected readonly controls = this.form.controls;
    protected readonly codeStatus = signal<CodeAvailabilityState>('available');
    protected readonly parentCode = this.context.mode === 'create'
        ? this.context.parent.structuralCode
        : this.context.account.structuralCode.parent;

    ngOnInit(): void {
        if (this.context.mode === 'edit') {
            const { account } = this.context;
            this.form.patchValue({
                localIndex: account.localIndex,
                name: account.name.value,
                description: account.description ?? '',
                isSummary: account.isSummary,
                isContra: account.isContra,
            });
        } else {
            this.form.patchValue({
                localIndex: this.context.nextAvailableIndex,
                isContra: this.context.parent.isContra,
            });
        }
        this.setupCodeAvailabilityCheck();
    }

    protected getErrorMessage(field: 'localIndex' | 'name'): string {
        const control = this.controls[field];
        if (!control.invalid || (!control.touched && !control.dirty)) return '';

        if (control.hasError('required')) return `O ${field === 'name' ? 'nome' : 'código'} é obrigatório.`;
        if (control.hasError('alreadyExists')) return 'Código já utilizado.';
        return control.getError('domainError') || 'Valor inválido.';
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const values = this.form.getRawValue();
        this.ref.close({
            structuralCode: this.buildStructuralCode(values.localIndex),
            name: this.buildName(values.name),
            description: values.description.trim() || null,
            isSummary: values.isSummary,
            isContra: values.isContra,
        });
    }

    private setupCodeAvailabilityCheck(): void {
        const context = this.context;
        if (context.mode !== 'create') return;

        const control = this.controls.localIndex;
        control.valueChanges.pipe(
            tap(val => this.codeStatus.set(!val || control.invalid ? 'invalid' : 'checking')),
            debounceTime(150),
            switchMap(val =>
                !val || control.invalid ?
                    of<CodeAvailabilityState>('invalid') :
                    context.checkIndexAvailability(val)),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(status => {
            this.codeStatus.set(status);
            if (status === 'taken') {
                control.setErrors({ alreadyExists: true });
            } else if (status === 'available' && control.hasError('alreadyExists')) {
                const { alreadyExists, ...errors } = control.errors || {};
                control.setErrors(Object.keys(errors).length ? errors : null);
            }
        });
    }

    private domainValidator(builder: (value: any) => void, fallbackMsg: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            try {
                builder(control.value);
                return null;
            } catch (error: unknown) {
                return { domainError: error instanceof ValueObjectMalformedException ? error.message : fallbackMsg };
            }
        };
    }

    private buildStructuralCode(raw: number): StructuralCodeValue {
        return this.parentCode?.createChild(raw) ?? StructuralCodeValue.createRoot(raw);
    }

    private buildName(raw: string): AccountNameValue {
        return AccountNameValue.create(raw);
    }
}