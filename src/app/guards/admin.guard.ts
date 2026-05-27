import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuarioActual();
  if (usuario && usuario.rol === 'administrador') {
    return true;
  }

  router.navigate(['/catalogo']);
  return false;
};
