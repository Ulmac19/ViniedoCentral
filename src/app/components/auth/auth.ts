import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TERMINOS_Y_CONDICIONES } from '../../legal/terminos.content';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  esLogin = true;
  mensajeError = signal('');
  cargando = signal(false);
  modalTerminos = false;
  readonly terminosContenido = TERMINOS_Y_CONDICIONES;

  nombre = '';
  email = '';
  password = '';
  aceptaMayorEdad = false;

  abrirTerminos(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.modalTerminos = true;
  }

  cambiarModo() {
    this.esLogin = !this.esLogin;
    this.mensajeError.set('');
    this.aceptaMayorEdad = false;
  }

  onSubmit() {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.mensajeError.set('');

    if (this.esLogin) {
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.cargando.set(false);
          const usuario = this.authService.usuarioActual();
          const destino = usuario?.rol === 'administrador' ? '/inventario' : '/catalogo';
          this.router.navigate([destino]);
        },
        error: (err) => {
          this.cargando.set(false);
          this.mensajeError.set(err.error?.error || 'Error al iniciar sesión');
        }
      });
    } else {
      const emailRegistrado = this.email;
      const passwordRegistrado = this.password;
      this.authService.registro(this.nombre, emailRegistrado, passwordRegistrado).subscribe({
        next: () => {
          this.authService.login(emailRegistrado, passwordRegistrado).subscribe({
            next: () => {
              this.cargando.set(false);
              this.router.navigate(['/catalogo']);
            },
            error: () => {
              this.cargando.set(false);
              this.esLogin = true;
              this.nombre = '';
              this.password = '';
              this.aceptaMayorEdad = false;
            }
          });
        },
        error: (err) => {
          this.cargando.set(false);
          this.mensajeError.set(err.error?.error || 'Error al registrar usuario');
        }
      });
    }
  }
}