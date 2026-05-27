import { Component, inject } from '@angular/core';
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

  // Variables para cambiar el modo de la pantalla
  esLogin = true; 
  mensajeError = '';

  // Variables del formulario
  nombre = '';
  email = '';
  password = '';
  aceptaMayorEdad = false;
  cargando = false;
  modalTerminos = false;
  readonly terminosContenido = TERMINOS_Y_CONDICIONES;

  abrirTerminos(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.modalTerminos = true;
  }

  cambiarModo() {
    this.esLogin = !this.esLogin;
    this.mensajeError = '';
    this.aceptaMayorEdad = false;
  }

  onSubmit() {
    if (this.cargando) return;
    this.cargando = true;
    this.mensajeError = '';

    if (this.esLogin) {
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.cargando = false;
          const usuario = this.authService.usuarioActual();
          const destino = usuario?.rol === 'administrador' ? '/inventario' : '/catalogo';
          this.router.navigate([destino]);
        },
        error: (err) => {
          this.cargando = false;
          this.mensajeError = err.error?.error || 'Error al iniciar sesión';
        }
      });
    } else {
      const emailRegistrado = this.email;
      const passwordRegistrado = this.password;
      this.authService.registro(this.nombre, emailRegistrado, passwordRegistrado).subscribe({
        next: () => {
          // Auto-login tras registro para no pedir credenciales dos veces
          this.authService.login(emailRegistrado, passwordRegistrado).subscribe({
            next: () => {
              this.cargando = false;
              this.router.navigate(['/catalogo']);
            },
            error: () => {
              // Si el auto-login falla, manda al formulario de login
              this.cargando = false;
              this.esLogin = true;
              this.nombre = '';
              this.password = '';
              this.aceptaMayorEdad = false;
            }
          });
        },
        error: (err) => {
          this.cargando = false;
          this.mensajeError = err.error?.error || 'Error al registrar usuario';
        }
      });
    }
  }
}