import { Routes } from "@angular/router";

export const COA_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./presentation/pages/coa-shell/coa-shell')
            .then(m => m.CoaShell),

        children: [
            {
                path: 'spreadsheet',
                loadComponent: () => import('./presentation/pages/accounts-page/accounts-page')
                    .then(m => m.AccountsPage)
            },
            {
                path: '**',
                redirectTo:'spreadsheet'
            },
        ]
    }
]