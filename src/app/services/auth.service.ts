import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  
  private apiUrl = 'http://localhost:3000/api/auth'; 

  // Señales para saber en toda la app si hay alguien logueado
  usuarioActual = signal<any>(null);
  token = signal<string | null>(null);

  constructor() {
    this.cargarSesionGuardada();
  }

  // 1. Iniciar Sesión (Login)
  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(respuesta => {
        this.guardarSesion(respuesta.token, respuesta.usuario);
      })
    );
  }

  // 2. Registrarse (Signin)
  registro(nombre: string, email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/registro`, { nombre, email, password });
  }

  // 3. Cerrar Sesión
  logout() {
    this.usuarioActual.set(null);
    this.token.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token_vitis');
      localStorage.removeItem('user_vitis');
    }
  }

  // --- Funciones internas ---
  private guardarSesion(token: string, usuario: any) {
    this.token.set(token);
    this.usuarioActual.set(usuario);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token_vitis', token);
      localStorage.setItem('user_vitis', JSON.stringify(usuario));
    }
  }

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