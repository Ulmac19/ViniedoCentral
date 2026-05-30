import {
  Component,
  inject,
  AfterViewInit,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  signal,
  computed
} from '@angular/core';
import { isPlatformBrowser, CurrencyPipe, JsonPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { PaypalService } from '../../services/paypal.service';
import { DireccionesService, Direccion } from '../../services/direcciones.service';
import { OrdenesService } from '../../services/ordenes.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, JsonPipe, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements AfterViewInit {
  @ViewChild('paypalHost') paypalHost?: ElementRef<HTMLElement>;

  private readonly carritoService = inject(CarritoService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly paypalApi = inject(PaypalService);
  private readonly ordenesService = inject(OrdenesService);
  private readonly direccionesService = inject(DireccionesService);

  // Propiedades del carrito
  productos = this.carritoService.productos;
  subtotal = this.carritoService.subtotal;
  costoEnvio = this.carritoService.costoEnvio;
  total = this.carritoService.total;
  totalArticulos = this.carritoService.totalArticulos;

  // Señales para el estado de PayPal
  readonly cargandoSdk = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly reciboEnviado = signal(false);
  readonly enviandoRecibo = signal(false);

  // Direcciones de entrega
  readonly direcciones = signal<Direccion[]>([]);
  readonly idSeleccionada = signal<number | null>(null);
  readonly direccionSeleccionada = computed(() =>
    this.direcciones().find(d => d.id_direccion === this.idSeleccionada()) ?? null
  );

  seleccionarDireccion(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idSeleccionada.set(id);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.direccionesService.getDirecciones().subscribe({
      next: (dirs) => {
        this.direcciones.set(dirs);
        if (dirs.length > 0) this.idSeleccionada.set(dirs[0].id_direccion!);
      }
    });
    if (this.productos().length > 0) {
      void this.inicializarPaypal();
    } else {
      this.cargandoSdk.set(false);
    }
  }

  quitar(id: number) { 
    this.carritoService.quitar(id); 
  }

  exportarXML() { 
    this.carritoService.exportarXML(); 
  }

  cambiarCantidad(id: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = Number(input.value); 
    
    if (valor > 0) {
      this.carritoService.actualizarCantidad(id, valor);
    }
  }

  // --- LÓGICA DE PAYPAL IMPORTADA DESDE CHECKOUT ---

  private construirPayload(): { items: any[]; total: number } {
    const lineas: any[] = this.productos().map((p) => ({
      id_producto: p.id,
      nombre: p.name,
      cantidad: p.cantidad,
      precio: p.price,
    }));
    
    if (this.productos().length > 0 && this.costoEnvio() > 0) {
      lineas.push({
        nombre: 'Envío',
        cantidad: 1,
        precio: this.costoEnvio(),
      });
    }
    return { items: lineas, total: this.total() };
  }

  private mensajeDeErrorHttp(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const body = e.error as Record<string, unknown> | null | undefined;
      if (body && typeof body === 'object') {
        if (typeof body['detalle'] === 'string') return body['detalle'];
        if (typeof body['error'] === 'string') return body['error'];
      }
      return e.message || `Error de red (HTTP ${e.status}). ¿Está el backend en ${e.url ?? 'la API'}?`;
    }
    if (e instanceof Error) return e.message;
    return String(e);
  }

  private esperarPayPalDesdeIndexHtml(): Promise<void> {
    const deadline = Date.now() + 20000;
    return new Promise((resolve, reject) => {
      const tick = () => {
        const win = window as unknown as {
          paypal?: { Buttons: (opts: unknown) => { render: (el: HTMLElement) => Promise<void> } };
        };
        if (win.paypal?.Buttons) {
          resolve();
          return;
        }
        if (Date.now() > deadline) {
          reject(new Error('No se cargó PayPal. Revisa el <script> en index.html (client-id válido).'));
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  private async inicializarPaypal(): Promise<void> {
    this.cargandoSdk.set(true);
    this.errorMsg.set(null);
    const host = this.paypalHost?.nativeElement;
    
    if (!host) {
      this.cargandoSdk.set(false);
      return;
    }

    try {
      await this.esperarPayPalDesdeIndexHtml();
      const win = window as unknown as {
        paypal: { Buttons: (opts: unknown) => { render: (el: HTMLElement) => Promise<void> } };
      };

      await win.paypal
        .Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay' },
          createOrder: async () => {
            try {
              const payload = this.construirPayload();
              const orden = await firstValueFrom(this.paypalApi.crearOrden(payload));
              if (!orden?.id) {
                throw new Error('El servidor no devolvió un id de orden.');
              }
              return orden.id;
            } catch (e) {
              const msg = this.mensajeDeErrorHttp(e);
              this.errorMsg.set(msg);
              throw new Error(msg);
            }
          },
          onApprove: async (data: { orderID: string }) => {
            try {
              await firstValueFrom(this.paypalApi.capturarOrden(data.orderID));
              this.carritoService.vaciarCarrito();

              this.enviandoRecibo.set(true);
              try {
                await firstValueFrom(this.ordenesService.enviarRecibo(data.orderID));
                this.reciboEnviado.set(true);
              } catch {
                // El pago ya se procesó — el recibo es secundario
                this.errorMsg.set('Pago exitoso, pero no se pudo enviar el recibo por correo.');
              } finally {
                this.enviandoRecibo.set(false);
              }

              setTimeout(() => void this.router.navigate(['/catalogo']), 2500);
            } catch (e) {
              this.errorMsg.set(this.mensajeDeErrorHttp(e));
              throw e;
            }
          },
          onError: (err: unknown) => {
            const msg = this.mensajeDeErrorHttp(err);
            this.errorMsg.set(msg);
          },
          onCancel: () => {
            this.errorMsg.set('Pago cancelado.');
          },
        })
        .render(host);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo iniciar PayPal';
      this.errorMsg.set(msg);
    } finally {
      this.cargandoSdk.set(false);
    }
  }
}