import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggingService } from '../services/logging.service';

export const httpLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggingService);
  const startTime = Date.now();

  logger.info(`HTTP ${req.method} ${req.url}`, { headers: req.headers });

  return next(req).pipe(
    tap(event => {
      const duration = Date.now() - startTime;
      logger.info(`HTTP ${req.method} ${req.url} completed in ${duration}ms`, event);
    }),
    catchError(error => {
      const duration = Date.now() - startTime;
      logger.error(`HTTP ${req.method} ${req.url} failed after ${duration}ms`, error);
      return throwError(() => error);
    })
  );
};
