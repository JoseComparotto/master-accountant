import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'coa',
        pathMatch: 'full'
    },
    {
        path: 'coa',
        loadChildren: () => import('./features/coa/coa.routes')
            .then(m => m.COA_ROUTES)
    },
    {
        path: '**',
        loadComponent: () => import('./shared/presentation/pages/not-found/not-found')
            .then(m => m.NotFound)
    }
];
