import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError(error => {
      const status = error.status;
      let message = 'Erro inesperado. Tente novamente.';

      if (status === 0) {
        message = 'Servidor indisponível. Usando dados locais.';
      } else if (status === 404) {
        message = 'Recurso não encontrado.';
      } else if (status === 400) {
        message = error.error?.message ?? 'Dados inválidos.';
      } else if (status >= 500) {
        message = 'Erro no servidor. Tente novamente mais tarde.';
      }

      snackBar.open(message, 'Fechar', { duration: 4000 });

      return throwError(() => error);
    })
  );
};
