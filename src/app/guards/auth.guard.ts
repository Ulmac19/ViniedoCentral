import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si hay un token activo en la señal del servicio
  if (authService.token()) {
    return true; // ¡Tiene sesión! Lo dejamos pasar
  } else {
    // No tiene sesión, lo pateamos de vuelta al login
    router.navigate(['/login']);
    return false;
  }
};