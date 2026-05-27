import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/producto/catalogo/catalogo.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { AuthComponent } from './components/auth/auth';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { InventarioComponent } from './components/inventario/inventario.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: AuthComponent },
    { path: 'catalogo', component: CatalogoComponent, canActivate: [authGuard] },
    { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
    { path: 'pedidos', component: PedidosComponent, canActivate: [authGuard] },
    { path: 'inventario', component: InventarioComponent, canActivate: [authGuard, adminGuard] },
    { path: '**', redirectTo: 'login' },
];