import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DireccionesService, Direccion } from '../../services/direcciones.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  authService = inject(AuthService);
  private direccionesService = inject(DireccionesService);
  private router = inject(Router);

  // Borradores del formulario — no actualizan la vista hasta guardar
  nombreDraft = '';
  emailDraft = '';
  mensajePerfil = signal('');
  errorPerfil = signal('');
  guardandoPerfil = signal(false);

  iniciales = computed(() => {
    const u = this.authService.usuarioActual();
    if (!u?.nombre) return '?';
    return u.nombre
      .split(' ')
      .filter((n: string) => n.length)
      .slice(0, 2)
      .map((n: string) => n[0].toUpperCase())
      .join('');
  });

  get hayCambios(): boolean {
    const u = this.authService.usuarioActual();
    return this.nombreDraft.trim() !== (u?.nombre ?? '') ||
           this.emailDraft.trim() !== (u?.email ?? '');
  }

  // Direcciones
  direcciones = signal<Direccion[]>([]);
  mensajeDireccion = signal('');

  // Modal dirección (crear / editar)
  modalDireccionAbierto = signal(false);
  modoEdicion = signal(false);
  errorModalDireccion = signal('');
  formulario = signal<Direccion>(this.direccionVacia());

  // Modal confirmar eliminar dirección
  modalConfirmDir = signal(false);
  dirAEliminar = signal<Direccion | null>(null);

  pedirConfirmacionEliminarDir(dir: Direccion) {
    this.dirAEliminar.set(dir);
    this.modalConfirmDir.set(true);
  }

  cancelarEliminarDir() {
    this.modalConfirmDir.set(false);
    this.dirAEliminar.set(null);
  }

  confirmarEliminarDir() {
    const dir = this.dirAEliminar();
    if (!dir) return;
    this.modalConfirmDir.set(false);
    this.direccionesService.eliminarDireccion(dir.id_direccion!).subscribe({
      next: () => {
        this.cargarDirecciones();
        this.dirAEliminar.set(null);
        this.mensajeDireccion.set('Dirección eliminada.');
        setTimeout(() => this.mensajeDireccion.set(''), 3000);
      },
      error: () => this.mensajeDireccion.set('Error al eliminar la dirección.')
    });
  }

  // Modal eliminar cuenta - paso 1
  modalEliminar1 = signal(false);
  // Modal eliminar cuenta - paso 2
  modalEliminar2 = signal(false);
  passwordConfirmacion = '';
  errorEliminar = signal('');
  eliminando = signal(false);

  get maxDirecciones() { return this.direcciones().length >= 4; }

  readonly ESTADOS_MX = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila de Zaragoza', 'Colima',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
    'Michoacán de Ocampo', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco',
    'Tamaulipas', 'Tlaxcala', 'Veracruz de Ignacio de la Llave', 'Yucatán', 'Zacatecas'
  ];

  ngOnInit() {
    const u = this.authService.usuarioActual();
    this.nombreDraft = u?.nombre ?? '';
    this.emailDraft = u?.email ?? '';
    this.cargarDirecciones();
  }

  cargarDirecciones() {
    this.direccionesService.getDirecciones().subscribe({
      next: (data) => this.direcciones.set(data),
      error: () => this.mensajeDireccion.set('Error al cargar las direcciones.')
    });
  }

  // --- Datos de la cuenta ---

  guardarPerfil() {
    if (!this.nombreDraft.trim() || !this.emailDraft.trim()) {
      this.errorPerfil.set('Nombre y email son obligatorios.');
      return;
    }
    this.guardandoPerfil.set(true);
    this.authService.actualizarPerfil({ nombre: this.nombreDraft.trim(), email: this.emailDraft.trim() }).subscribe({
      next: () => {
        this.mensajePerfil.set('Datos actualizados correctamente.');
        this.errorPerfil.set('');
        this.guardandoPerfil.set(false);
        setTimeout(() => this.mensajePerfil.set(''), 3000);
      },
      error: (e) => {
        this.errorPerfil.set(e.error?.error ?? 'Error al guardar.');
        this.guardandoPerfil.set(false);
      }
    });
  }

  // --- Eliminar cuenta ---

  abrirModalEliminar() { this.modalEliminar1.set(true); }
  cerrarModalEliminar1() { this.modalEliminar1.set(false); }

  confirmarPaso1() {
    this.modalEliminar1.set(false);
    this.passwordConfirmacion = '';
    this.errorEliminar.set('');
    this.modalEliminar2.set(true);
  }

  cerrarModalEliminar2() {
    this.modalEliminar2.set(false);
    this.passwordConfirmacion = '';
    this.errorEliminar.set('');
  }

  confirmarEliminarCuenta() {
    if (!this.passwordConfirmacion) {
      this.errorEliminar.set('Ingresa tu contraseña para confirmar.');
      return;
    }
    this.eliminando.set(true);
    this.authService.eliminarCuenta(this.passwordConfirmacion).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (e) => {
        this.errorEliminar.set(e.error?.error ?? 'Error al eliminar la cuenta.');
        this.eliminando.set(false);
      }
    });
  }

  // --- Direcciones ---

  private direccionVacia(): Direccion {
    return {
      alias: '', calle: '', numero_exterior: '', numero_interior: '',
      colonia: '', municipio: '', ciudad: '', estado: '',
      codigo_postal: '', referencias: ''
    };
  }

  abrirModalNueva() {
    this.formulario.set(this.direccionVacia());
    this.modoEdicion.set(false);
    this.errorModalDireccion.set('');
    this.modalDireccionAbierto.set(true);
  }

  abrirModalEditar(dir: Direccion) {
    this.formulario.set({ ...dir });
    this.modoEdicion.set(true);
    this.errorModalDireccion.set('');
    this.modalDireccionAbierto.set(true);
  }

  cerrarModalDireccion() {
    this.modalDireccionAbierto.set(false);
    this.errorModalDireccion.set('');
  }

  guardarDireccion() {
    const f = this.formulario();
    const op = this.modoEdicion()
      ? this.direccionesService.actualizarDireccion(f.id_direccion!, f)
      : this.direccionesService.crearDireccion(f);

    op.subscribe({
      next: () => {
        this.cargarDirecciones();
        this.cerrarModalDireccion();
        const msg = this.modoEdicion() ? 'Dirección actualizada.' : 'Dirección agregada.';
        this.mensajeDireccion.set(msg);
        setTimeout(() => this.mensajeDireccion.set(''), 3000);
      },
      error: (e) => this.errorModalDireccion.set(e.error?.error ?? 'Error al guardar.')
    });
  }

  eliminarDireccion(dir: Direccion) {
    this.pedirConfirmacionEliminarDir(dir);
  }

  setCampo(campo: keyof Direccion, valor: string) {
    this.formulario.update(f => ({ ...f, [campo]: valor }));
  }
}
