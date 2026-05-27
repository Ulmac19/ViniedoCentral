import { Component, inject, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/producto.model';
import { Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../services/producto.service';
import { CarritoService } from '../../../services/carrito.service';
import { ProductCardComponent } from '../producto/producto.component';
import { AuthService } from '../../../services/auth.service';
import { AVISO_PRIVACIDAD } from '../../../legal/aviso-privacidad.content';
import { TERMINOS_Y_CONDICIONES } from '../../../legal/terminos.content';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent, RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent {
  //Inyectamos el AuthService para acceder a la sesión
  public authService = inject(AuthService);

  //Creamos una señal computada que extrae solo el primer nombre
  primerNombre = computed(() => {
    const usuario = this.authService.usuarioActual();
    if (usuario && usuario.nombre) {
      // Divide el string por espacios y toma la posición 0 (el primer nombre)
      return usuario.nombre.split(' ')[0]; 
    }
    return 'Invitado'; // Valor por defecto si no hay sesión
  });

  products = signal<Product[]>([]);
  searchTerm = signal<string>('');

  //LOgica por filtrado
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.products();

    return this.products().filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.category.toLowerCase().includes(term)
    );
  });

  inStockCount = computed(() => this.products().filter(p => p.inStock).length);

  constructor(
    public productsService: ProductsService,
    public carritoService: CarritoService
  ) {
    this.productsService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Error cargando XML:', err),
    });
  }

  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  agregar(eventData: {producto: Product, cantidad: number}) {
    this.carritoService.agregar(eventData.producto, eventData.cantidad);
  }

  productoSeleccionado = signal<Product | null>(null);
  sidebarAbierto = signal(false);
  editandoDireccion = signal(false);
  nuevaDireccion = signal('');

  private router = inject(Router);

  abrirModal(producto: Product) { this.productoSeleccionado.set(producto); }
  cerrarModal()                  { this.productoSeleccionado.set(null); }

  modalLegal = signal<'terminos' | 'privacidad' | null>(null);

  tituloLegal = computed(() => {
    if (this.modalLegal() === 'terminos')   return 'Términos y Condiciones';
    if (this.modalLegal() === 'privacidad') return 'Aviso de Privacidad';
    return '';
  });

  contenidoLegal = computed(() => {
    if (this.modalLegal() === 'terminos')   return TERMINOS_Y_CONDICIONES;
    if (this.modalLegal() === 'privacidad') return AVISO_PRIVACIDAD;
    return '';
  });

  abrirLegal(tipo: 'terminos' | 'privacidad') { this.modalLegal.set(tipo); }
  cerrarLegal() { this.modalLegal.set(null); }

  editandoPerfil = signal(false);
  perfilNombre = '';
  perfilEmail = '';
  perfilPassword = '';
  perfilConfirmPassword = '';

  iniciarEdicionPerfil() {
    const u = this.authService.usuarioActual();
    this.perfilNombre = u?.nombre ?? '';
    this.perfilEmail = u?.email ?? '';
    this.perfilPassword = '';
    this.perfilConfirmPassword = '';
    this.editandoPerfil.set(true);
  }

  guardarPerfil() {
    if (!this.perfilNombre.trim() || !this.perfilEmail.trim()) return;
    if (this.perfilPassword && this.perfilPassword !== this.perfilConfirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    const payload: any = { nombre: this.perfilNombre.trim(), email: this.perfilEmail.trim() };
    if (this.perfilPassword) payload.password = this.perfilPassword;
    this.authService.actualizarPerfil(payload).subscribe({
      next: () => this.editandoPerfil.set(false),
      error: (err) => alert(err.error?.error ?? 'Error al guardar los datos.')
    });
  }

  abrirSidebar() {
    this.sidebarAbierto.set(true);
    this.editandoDireccion.set(false);
    this.editandoPerfil.set(false);
    this.authService.cargarDireccion().subscribe();
  }
  cerrarSidebar() {
    this.sidebarAbierto.set(false);
    this.editandoDireccion.set(false);
    this.editandoPerfil.set(false);
  }

  iniciarEdicionDireccion() {
    this.nuevaDireccion.set(this.authService.direccion());
    this.editandoDireccion.set(true);
  }

  guardarDireccion() {
    const dir = this.nuevaDireccion().trim();
    if (!dir) return;
    this.authService.actualizarDireccion(dir).subscribe({
      next: () => this.editandoDireccion.set(false),
      error: () => alert('Error al guardar la dirección')
    });
  }

  get direccionActual() { return this.authService.direccion(); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get esAdmin() {
    return this.authService.usuarioActual()?.rol === 'administrador';
  }

  get emailUsuario() {
    return this.authService.usuarioActual()?.email ?? '';
  }

  get inicialUsuario() {
    return this.primerNombre()[0]?.toUpperCase() ?? '?';
  }
}