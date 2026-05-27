import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional que protege las rutas privadas de la aplicación.
 *
 * Se aplica en app.routes.ts sobre /catalogo, /carrito y /pedidos. *
 * Lógica:
 *   - Consulta la señal token() del AuthService (reactiva, no un getter síncrono)
 *   - Si hay token → devuelve true y Angular renderiza el componente solicitado
 *   - Si no hay token → redirige a /login y devuelve false, cancelando la navegación
 *
 * La fuente de verdad es la señal, no localStorage directamente;
 * AuthService se encarga de sincronizarlas al iniciar la app.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.token()) {
    return true; // Sesión activa → acceso permitido
  } else {
    // Sin sesión → redirige al login sin dejar acceder a la ruta protegida
    router.navigate(['/login']);
    return false;
  }
};