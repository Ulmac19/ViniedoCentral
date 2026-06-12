import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * adminGuard — Restringe una ruta a usuarios con rol 'administrador'.
 * Se usa en /inventario (junto a authGuard). Si el usuario no es admin,
 * lo redirige a /catalogo y cancela la navegación.
 */
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
