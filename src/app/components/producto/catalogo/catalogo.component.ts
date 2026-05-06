import { Component, inject, computed, signal } from '@angular/core';
import { Product } from '../../../models/producto.model';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../services/producto.service';
import { CarritoService } from '../../../services/carrito.service';
import { ProductCardComponent } from '../producto/producto.component';
import { AuthService } from '../../../services/auth.service'; 

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent, RouterLink],
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
}