import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * clienteGuard — Protege las rutas de cliente (/catalogo, /carrito, /pedidos, /perfil).
 *
 * Dos comprobaciones:
 *   - Sin token → al /login.
 *   - Con token pero rol 'administrador' → al /inventario (el admin no usa la
 *     tienda como cliente).
 * Solo un cliente autenticado obtiene acceso.
 */
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
