/**
 * app.config.ts — Configuración raíz de la aplicación (providers globales).
 *
 * Registra el router, la hidratación para SSR y el HttpClient con `withFetch()`.
 * Nota importante: con withFetch() los callbacks de subscribe corren fuera de la
 * zona de Angular, por eso el estado que depende de respuestas HTTP debe usar
 * signals (no propiedades planas) o la vista no se actualizará.
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()) 
  ]
};
