import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

/**
 * Servicio central de autenticación.
 * Gestiona el ciclo completo de sesión: login, registro, logout y persistencia.
 *
 * Estado reactivo (señales públicas):
 *   token         → JWT activo; null si no hay sesión. Lo consume authGuard.
 *   usuarioActual → Datos del usuario logueado (id, nombre, rol).
 *
 * Persistencia:
 *   Usa localStorage (claves token_vitis / user_vitis) para sobrevivir recargas.
 *   isPlatformBrowser evita errores en SSR, donde localStorage no existe.
 *
 * Flujo típico:
 *   1. Al iniciar la app el constructor llama cargarSesionGuardada() →
 *      rehidrata las señales desde localStorage si el usuario ya tenía sesión.
 *   2. login() hace POST /api/auth/login; con tap() guarda token y usuario
 *      en señales y localStorage sin necesidad de suscripción manual.
 *   3. logout() limpia señales y localStorage, dejando la app en estado inicial.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // PLATFORM_ID permite detectar si estamos en navegador o en servidor (SSR)
  private platformId = inject(PLATFORM_ID);

  private apiUrl = 'http://localhost:3000/api/auth';

  // Señales públicas: cualquier componente puede leerlas sin subscribe()
  usuarioActual = signal<any>(null);
  token = signal<string | null>(null);

  constructor() {
    // Rehidrata la sesión al arrancar; así el guard no ve token=null en el primer ciclo
    this.cargarSesionGuardada();
  }

  /** Autentica al usuario. El pipe tap persiste la sesión como efecto secundario. */
  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(respuesta => {
        this.guardarSesion(respuesta.token, respuesta.usuario);
      })
    );
  }

  /** Crea una cuenta nueva. No inicia sesión automáticamente; el componente redirige al login. */
  registro(nombre: string, email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/registro`, { nombre, email, password });
  }

  private authHeaders() {
    return { Authorization: `Bearer ${this.token()}` };
  }

  actualizarPerfil(datos: { nombre: string; email: string; password?: string }) {
    return this.http.put<any>(`${this.apiUrl}/perfil`, datos, { headers: this.authHeaders() }).pipe(
      tap(respuesta => {
        const actualizado = { ...this.usuarioActual(), nombre: respuesta.nombre, email: respuesta.email };
        this.usuarioActual.set(actualizado);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user_vitis', JSON.stringify(actualizado));
        }
      })
    );
  }

  eliminarCuenta(password: string) {
    return this.http.delete<any>(`${this.apiUrl}/cuenta`, {
      headers: this.authHeaders(),
      body: { password }
    });
  }

  /** Destruye la sesión local. No llama al backend porque los JWT son stateless. */
  logout() {
    this.usuarioActual.set(null);
    this.token.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token_vitis');
      localStorage.removeItem('user_vitis');
    }
  }

  /** Escribe el estado de sesión en señales y en localStorage para persistirlo entre recargas. */
  private guardarSesion(token: string, usuario: any) {
    this.token.set(token);
    this.usuarioActual.set(usuario);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token_vitis', token);
      localStorage.setItem('user_vitis', JSON.stringify(usuario));
    }
  }

  /** Lee localStorage al iniciar y restaura las señales si existía una sesión previa. */
  private cargarSesionGuardada() {
    if (isPlatformBrowser(this.platformId)) {
      const tokenGuardado = localStorage.getItem('token_vitis');
      const usuarioGuardado = localStorage.getItem('user_vitis');
      if (tokenGuardado && usuarioGuardado) {
        this.token.set(tokenGuardado);
        this.usuarioActual.set(JSON.parse(usuarioGuardado));
      }
    }
  }
}