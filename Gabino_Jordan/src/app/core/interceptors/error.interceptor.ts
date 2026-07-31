import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensaje = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente (red, etc.)
        mensaje = `Error de conexión: ${error.error.message}`;
      } else {
        // Error devuelto por el backend
        switch (error.status) {
          case 400:
            mensaje = 'Solicitud inválida';
            break;
          case 401:
            mensaje = 'No autorizado. Inicia sesión nuevamente';
            break;
          case 403:
            mensaje = 'No tienes permisos para realizar esta acción';
            break;
          case 404:
            mensaje = 'Recurso no encontrado';
            break;
          case 500:
            mensaje = 'Error interno del servidor';
            break;
          default:
            mensaje = `Error ${error.status}: ${error.message}`;
        }
      }

      console.error('[HTTP Error]', mensaje, error);
      return throwError(() => new Error(mensaje));
    })
  );
};
