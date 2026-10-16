import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  request,
  next
) => {

  const token = localStorage.getItem('admin_token');

  const ehRequisicaoProtegida =
    request.url.includes('/api/pedidos/admin/') ||
    request.url.includes('/api/relatorios/') ||
    request.url.includes('/api/admin/') ||
    request.url.includes('/api/auth/me/') ||
    request.url.includes('/api/auth/logout/');

  if (token && ehRequisicaoProtegida) {
    request = request.clone({
      setHeaders: {
        Authorization: `Token ${token}`
      }
    });
  }

  return next(request);
};