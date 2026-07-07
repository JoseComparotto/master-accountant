import { Routes } from "@angular/router";

export const COA_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./presentation/pages/coa-shell/coa-shell')
            .then(m => m.CoaShell),

        children: [
            {
                path: 'explorer',
                loadComponent: () => import('./presentation/pages/explorer-view/explorer-view')
                    .then(m => m.ExplorerView)
            },
            {
                path: 'explorer/:id',
                loadComponent: () => import('./presentation/pages/explorer-view/explorer-view')
                    .then(m => m.ExplorerView)
            },
            {
                path: 'spreadsheet',
                loadComponent: () => import('./presentation/pages/spreadsheet-view/spreadsheet-view')
                    .then(m => m.SpreadsheetView)
            },
            {
                path: '**',
                redirectTo:'explorer'
            },
        ]
    }
]