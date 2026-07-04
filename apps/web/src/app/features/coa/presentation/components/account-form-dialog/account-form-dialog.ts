import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { HlmButtonImports } from "@libs/ui/components/button/src";
import { HlmDialogImports } from "@libs/ui/components/dialog/src";
import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/brain/dialog";
import { HlmFieldImports } from "@libs/ui/components/field/src";
import { HlmInputImports } from "@libs/ui/components/input/src";
import { AccountEntity, AccountNameValue } from "@repo/coa-core";
import { AccountTitle } from "../account-title/account-title";
import { form, FormField } from '@angular/forms/signals';
import { HlmInputGroupImports } from "@libs/ui/components/input-group/src";
import { HlmSwitchImports } from "@libs/ui/components/switch/src";

export type AccontFormDialogContext = {
    mode: 'edit',
    account: Readonly<AccountEntity>
} | {
    mode: 'create',
    parent: Readonly<AccountEntity>,
}

export type AccontFormDialogResult = {
    name: AccountNameValue,
    description: string | null,
    isSummary: boolean,
    isContra: boolean,
}

@Component({
    selector: 'app-account-form-dialog',
    imports: [
        AccountTitle,
        FormField,
        HlmDialogImports,
        HlmButtonImports,
        HlmFieldImports,
        HlmInputImports,
        HlmInputGroupImports,
        HlmSwitchImports,
    ],
    host: {
        class: 'flex flex-col gap-3'
    },
    templateUrl: './account-form-dialog.html',
})
export class AccontFormDialog implements OnInit {

    private readonly ref = inject<BrnDialogRef<AccontFormDialogResult>>(BrnDialogRef);
    protected readonly context = injectBrnDialogContext<AccontFormDialogContext>();

    protected model = signal({
        name: '',
        description: '',
        isSummary: false,
        isContra: true
    });
    protected form = form(this.model);

    public readonly descriptionLength = computed(() => this.model().description.length);

    ngOnInit(): void {
        if (this.context.mode === 'edit') {
            this.model.set({
                name: this.context.account.name.value,
                description: this.context.account.description ?? '',
                isSummary: this.context.account.isSummary,
                isContra: this.context.account.isContra,
            })
        } else{
            this.model.set({
                name: '',
                description: '',
                isSummary: false,
                isContra: this.context.parent.isContra,
            })
        }
    }

    protected onSubmit() {
        const {
            name,
            description,
            isSummary,
            isContra,
        } = this.form().value();

        this.ref.close({
            name: AccountNameValue.create(name),
            description: nonEmptyOrNull(description),
            isSummary: isSummary,
            isContra: isContra,
        });
    }

}

function nonEmptyOrNull(value: string): string | null {
    const trimed = value.trim();
    return trimed === '' ? null : trimed;
}
