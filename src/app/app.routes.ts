/**
 * app.routes.ts — Tabla de rutas de la aplicación.
 *
 * Cada ruta declara qué componente renderiza y qué guards deben pasar antes:
 *   clienteGuard → rutas de cliente (bloquea invitados y administradores).
 *   authGuard + adminGuard → /inventario (solo administradores).
 * La ruta vacía y las desconocidas (**) redirigen a /login.
 */
import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/producto/catalogo/catalogo.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { AuthComponent } from './components/auth/auth';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { clienteGuard } from './guards/cliente.guard';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { PerfilComponent } from './components/perfil/perfil.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: AuthComponent },
    { path: 'catalogo', component: CatalogoComponent, canActivate: [clienteGuard] },
    { path: 'carrito', component: CarritoComponent, canActivate: [clienteGuard] },
    { path: 'pedidos', component: PedidosComponent, canActivate: [clienteGuard] },
    { path: 'inventario', component: InventarioComponent, canActivate: [authGuard, adminGuard] },
    { path: 'perfil', component: PerfilComponent, canActivate: [clienteGuard] },
    { path: '**', redirectTo: 'login' },
];