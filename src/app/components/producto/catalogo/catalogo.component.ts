import { Component, inject, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
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
  imports: [ProductCardComponent, RouterLink, CurrencyPipe],
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
  searchTerm = signal<string>(''); //Texto que el usuario ingresa en el campo de búsqueda
  categoriasActivas = signal<string[]>([]); //Categorías que el usuario ha seleccionado para filtrar
  soloEnStock = signal(false); //Indica si el usuario quiere ver solo productos en stock
  filtrosAbiertos = signal(false);

  categorias = computed(() =>
    [...new Set(this.products().map(p => p.category))].sort()
  );

  // Método para alternar la selección de una categoría en el filtro
  toggleCategoria(cat: string) {
    this.categoriasActivas.update(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat] // Si la categoría ya está activa, la quitamos; si no, la agregamos
    );
  }

  limpiarFiltros() {
    this.categoriasActivas.set([]);
    this.soloEnStock.set(false);
  }

  get totalFiltrosActivos() {
    return this.categoriasActivas().length + (this.soloEnStock() ? 1 : 0);
  }

  // Computed que devuelve la lista de productos filtrados según el término de búsqueda, las categorías seleccionadas y el filtro de stock
  filteredProducts = computed(() => {
    const term  = this.searchTerm().toLowerCase().trim();
    const cats  = this.categoriasActivas();
    const stock = this.soloEnStock();

    return this.products().filter(p => {
      const matchSearch = !term || p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
      const matchCat    = cats.length === 0 || cats.includes(p.category);
      const matchStock  = !stock || p.inStock;
      return matchSearch && matchCat && matchStock; // El producto debe cumplir con todas las condiciones para ser incluido en la lista filtrada
    });
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

  // Método para manejar el evento de búsqueda
  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement; // Aseguramos que el target es un input
    this.searchTerm.set(inputElement.value); // Actualizamos la señal con el nuevo término de búsqueda
  }

  toast = signal('');
  aviso = signal('');
  private toastTimer: any = null;
  private avisoTimer: any = null;

  agregar(eventData: {producto: Product, cantidad: number}) {
    const { producto, cantidad } = eventData; // Desestructuramos el objeto recibido para obtener el producto y la cantidad
    const enCarrito = this.carritoService.productos().find(p => p.id === producto.id)?.cantidad ?? 0; // Cantidad del producto que ya está en el carrito
    const disponible = producto.stock - enCarrito;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.avisoTimer) clearTimeout(this.avisoTimer);

    // Si no hay unidades disponibles para agregar, mostramos un aviso y no hacemos nada
    if (disponible <= 0) {
      this.aviso.set(`Ya tienes el máximo disponible de "${producto.name}" en tu carrito (${producto.stock} u.).`);
      this.avisoTimer = setTimeout(() => this.aviso.set(''), 3500);
      return;
    }
    // Si la cantidad solicitada excede lo disponible, agregamos solo lo que queda y mostramos un aviso
    if (cantidad > disponible) {
      this.carritoService.agregar(producto, disponible);
      this.aviso.set(`Solo se agregaron ${disponible} de "${producto.name}" — es todo el stock disponible.`);
      this.avisoTimer = setTimeout(() => this.aviso.set(''), 3500);
      return;
    }

    this.carritoService.agregar(producto, cantidad); // Agregamos la cantidad solicitada al carrito
    this.toast.set(producto.name);
    this.toastTimer = setTimeout(() => this.toast.set(''), 2500);
  }

  productoSeleccionado = signal<Product | null>(null);
  sidebarAbierto = signal(false);

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

  tasaIEPS = computed(() => {
    const grad = this.productoSeleccionado()?.graduacionAlcoholica ?? 0;
    if (grad <= 14) return 26.5;
    if (grad <= 20) return 30;
    return 53;
  });

  abrirSidebar() { this.sidebarAbierto.set(true); }
  cerrarSidebar() { this.sidebarAbierto.set(false); }

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