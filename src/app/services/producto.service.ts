import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  public allProducts = signal<Product[]>([]);

  constructor(private http: HttpClient) {
    this.cargarProductos();
  }

  getAll(): Observable<Product[]> {
    // Pedimos el XML como texto plano
    return this.http.get('/assets/productos.xml', { responseType: 'text' }).pipe(
      map((xmlText) => this.parseProductsXml(xmlText))
    );
  }

  private cargarProductos() {
    this.http.get('/assets/productos.xml', { responseType: 'text' }).pipe(
      map((xmlText) => this.parseProductsXml(xmlText))
    ).subscribe({
      next: (prods) => this.allProducts.set(prods), // Guardamos en la señal
      error: (err) => console.error('Error cargando XML', err)
    });
  }

  private parseProductsXml(xmlText: string): Product[] {
    //Si DOMParser no existe (estamos en el servidor de Node.js), regresa vacío.
    if (typeof DOMParser === 'undefined') {
      return [];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    // Si el XML está mal formado, normalmente aparece <parsererror>
    if (doc.getElementsByTagName('parsererror').length > 0) {
      return [];
    }

    const nodes = Array.from(doc.getElementsByTagName('product'));

    return nodes.map((node) => ({
    id: this.getNumber(node, 'id'),
    name: this.getText(node, 'name'),
    price: this.getNumber(node, 'price'),
    imageUrl: this.getText(node, 'imageUrl'),
    category: this.getText(node, 'category'),
    description: this.getText(node, 'description'),
    inStock: this.getBoolean(node, 'inStock'),
    cantidad: 1,
    }));
  }

  private getText(parent: Element, tag: string): string {
    return parent.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
  }

  private getNumber(parent: Element, tag: string): number {
    const value = this.getText(parent, tag);
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  private getBoolean(parent: Element, tag: string): boolean {
    const value = this.getText(parent, tag).toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  }
}
