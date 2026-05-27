import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private platformId = inject(PLATFORM_ID);

  edadVerificada = signal(false);
  menorDeEdad = signal(false);

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
