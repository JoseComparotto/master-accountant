import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../envs/env';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
    const apiReq = req.clone({
      url: `${environment.apiUrl}${req.url}`
    });
    return next(apiReq);
  }
  
  return next(req);
};