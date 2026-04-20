import { Component, inject, computed, signal } from '@angular/core';
import { Product } from '../../../models/producto.model';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../services/producto.service';
import { CarritoService } from '../../../services/carrito.service';
import { ProductCardComponent } from '../producto/producto.component';


@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent {
  products = signal<Product[]>([]);

  searchTerm = signal<string>('');
  // Lógica de filtrado en tiempo real (RF2.2)
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
    // Actualizamos la señal del término de búsqueda
    this.searchTerm.set(inputElement.value);
  }

  agregar(eventData: {producto: Product, cantidad: number}) {
  this.carritoService.agregar(eventData.producto, eventData.cantidad);
}
}



