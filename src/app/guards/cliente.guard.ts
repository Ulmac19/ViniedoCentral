import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const clienteGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.token();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.usuarioActual()?.rol === 'administrador') {
    router.navigate(['/inventario']);
    return false;
  }

  return true;
};
