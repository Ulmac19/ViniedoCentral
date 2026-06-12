import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * App — Componente raíz. Aloja el <router-outlet> y la verificación de edad.
 *
 * Por ser venta de alcohol, antes de mostrar la app se pide confirmar la mayoría
 * de edad. La respuesta se guarda en sessionStorage (dura lo que la pestaña),
 * por eso solo se accede a sessionStorage en navegador (isPlatformBrowser),
 * nunca durante el render del servidor (SSR).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private platformId = inject(PLATFORM_ID);

  edadVerificada = signal(false); // true si el visitante ya confirmó ser mayor de edad
  menorDeEdad = signal(false);    // true si declaró ser menor (se le bloquea el acceso)

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.edadVerificada.set(sessionStorage.getItem('edad_verificada') === 'true');
    }
  }

  confirmarMayorEdad() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('edad_verificada', 'true');
    }
    this.edadVerificada.set(true);
  }

  confirmarMenorEdad() {
    this.menorDeEdad.set(true);
  }
}
