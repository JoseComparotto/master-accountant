import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { IChartOfAccountsRepository } from '@repo/coa-core';
import { ApiChartOfAccountsRepository } from './features/coa/infrastructure/repositories/api-coa.repository';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './shared/infrastructure/interceptors/api.interceptor';

export const COA_REPOSITORY = new InjectionToken<IChartOfAccountsRepository>('IChartOfAccountsRepository');


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: COA_REPOSITORY,
      useClass: ApiChartOfAccountsRepository
    },
    provideHttpClient(
      withInterceptors([apiInterceptor])
    )
  ],
};
