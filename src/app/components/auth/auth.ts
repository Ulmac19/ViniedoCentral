import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

  cambiarModo() {
    this.esLogin = !this.esLogin;
    this.mensajeError = '';
  }

  onSubmit() {
    this.mensajeError = ''; 

    if (this.esLogin) {
      // Lógica de Login
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.router.navigate(['/catalogo']); 
        },
        error: (err) => {
          this.mensajeError = err.error?.error || 'Error al iniciar sesión';
        }
      });
    } else {
      // LÓGICA DE REGISTRO (SIGNIN)
      this.authService.registro(this.nombre, this.email, this.password).subscribe({
        next: () => {
          // 1. En lugar del alert, simplemente cambiamos a modo login
          this.esLogin = true; 
          
          // 2. Opcional: Limpiamos el nombre pero dejamos el email 
          // para que el usuario solo tenga que poner su contraseña
          this.nombre = '';
          this.password = '';
          
          // Podrías poner un mensaje de éxito discreto en la variable de error si quisieras
          // this.mensajeError = 'Cuenta creada. Por favor, inicia sesión.';
        },
        error: (err) => {
          this.mensajeError = err.error?.error || 'Error al registrar usuario';
        }
      });
    }
  }
}