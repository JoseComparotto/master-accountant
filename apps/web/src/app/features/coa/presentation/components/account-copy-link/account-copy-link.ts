import { Component, inject, input } from "@angular/core";
import { Clipboard } from '@angular/cdk/clipboard';
import { AccountEntity } from "@repo/coa-core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLink } from "@ng-icons/lucide";
import { Router } from "@angular/router";
import { HlmButtonImports } from "@spartan-ng/helm/button";

@Component({
    selector: 'app-account-copy-link',
    templateUrl: './account-copy-link.html',
    imports: [
        HlmButtonImports,
        NgIcon,
    ],
    viewProviders: [
        provideIcons({
            lucideLink
        })
    ]
})
export class AccountCopyLink {
    private readonly router = inject(Router);

    readonly account = input.required<Readonly<AccountEntity>>();

    protected copyLink(e: MouseEvent) {
        e.stopPropagation();
        const account = this.account();

        const urlTree = this.router.createUrlTree(['/coa/explorer', account.id.value]);
        const relativeUrl = this.router.serializeUrl(urlTree);
        const absoluteUrl = `${window.location.origin}${relativeUrl}`;

        const labelText = `${account.structuralCode.value}. ${account.name.value}`;
        const htmlLink = `<a href="${absoluteUrl}">${labelText}</a>`;

        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([htmlLink], { type: 'text/html' }),
                'text/plain': new Blob([absoluteUrl], { type: 'text/plain' })
            })
        ]);
    }
}