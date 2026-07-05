import { Component, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule } from "@angular/forms";

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
    structuralCode: StructuralCodeValue,
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
    protected readonly context = injectBrnDialogContext<AccountFormDialogContext>();

    static defaultDialogOptions: Partial<HlmDialogOptions> = {
        contentClass: 'sm:max-w-lg w-lg min-w-[320px]'
    };

    protected form = this.fb.nonNullable.group({
        localIndex: [1, [Validators.required, this.structuralCodeValidator()]],
        name: ['', [Validators.required, this.accountNameValidator()]],
        description: [''],
        isSummary: [false],
        isContra: [false]
    });

    protected codeStatus = signal<CodeAvailabilityState>('available');
    protected parentCode = this.context.mode === 'create' ?
        this.context.parent.structuralCode :
        this.context.account.structuralCode.parent;

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
                name: '',
                description: '',
                isSummary: false,
                isContra: this.context.parent.isContra,
            });
        }
        this.setupCodeAvailabilityCheck();
    }

    protected get localIndexError(): string {
        const control = this.form.controls.localIndex;
        if (!control.invalid || (!control.touched && !control.dirty)) return '';

        if (control.hasError('required')) return 'O código é obrigatório.';
        if (control.hasError('alreadyExists')) return 'Código já utilizado.';
        if (control.hasError('domainError')) return control.getError('domainError');

        return 'Código inválido.';
    }

    protected get nameError(): string {
        const control = this.form.controls.name;
        if (!control.invalid || (!control.touched && !control.dirty)) return '';

        if (control.hasError('required')) return 'O nome é obrigatório.';
        if (control.hasError('domainError')) return control.getError('domainError');

        return 'Nome inválido.';
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const {
            localIndex,
            name,
            description,
            isSummary,
            isContra
        } = this.form.getRawValue();

        this.ref.close({
            structuralCode: this.buildStructuralCode(localIndex),
            name: this.buildName(name),
            description: this.buildDescription(description),
            isSummary,
            isContra,
        });
    }

    private setupCodeAvailabilityCheck(): void {
        const control = this.form.controls.localIndex;

        if (this.context.mode !== 'create') return;

        const checkFn = this.context.checkIndexAvailability;

        control.valueChanges.pipe(
            tap((value) => {
                if (control.invalid || !value) {
                    this.codeStatus.set('invalid');
                } else {
                    this.codeStatus.set('checking');
                }
            }),
            debounceTime(100),
            switchMap((value) => {
                if (control.invalid || !value) {
                    return of<CodeAvailabilityState>('invalid');
                }
                return checkFn(value);
            })
        ).subscribe((status) => {
            this.codeStatus.set(status);
            if (status === 'taken') {
                control.setErrors({ alreadyExists: true });
            } else if (status === 'available') {
                if (control.hasError('alreadyExists')) {
                    const errors = { ...control.errors };
                    delete errors['alreadyExists'];
                    control.setErrors(Object.keys(errors).length ? errors : null);
                }
            }
        });
    }

    private structuralCodeValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            try {
                this.buildStructuralCode(control.value);
                return null;
            } catch (error: unknown) {
                if (error instanceof ValueObjectMalformedException) {
                    return { domainError: error.message };
                }
                return { domainError: 'Código inválido.' };
            }
        };
    }

    private accountNameValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            try {
                this.buildName(control.value);
                return null;
            } catch (error: unknown) {
                if (error instanceof ValueObjectMalformedException) {
                    return { domainError: error.message };
                }
                return { domainError: 'Nome de conta inválido.' };
            }
        };
    }

    private buildStructuralCode(raw: number): StructuralCodeValue {
        return this.parentCode?.createChild(raw)
            ?? StructuralCodeValue.createRoot(raw);
    }
    private buildName(raw: string): AccountNameValue {
        return AccountNameValue.create(raw);
    }

    private buildDescription(value: string): string | null {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }
}