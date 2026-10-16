import { Routes } from '@angular/router';

import { Produtos } from './pages/produtos/produtos';
import { ProdutoDetalhe } from './pages/produto-detalhe/produto-detalhe';
import { Carrinho } from './pages/carrinho/carrinho';
import { Checkout } from './pages/checkout/checkout';
import { Home } from './pages/home/home';
import { Relatorios } from './pages/relatorios/relatorios';
import { Login } from './pages/admin/login/login';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { adminGuard } from './core/guards/admin.guard';
import { Pedidos } from './pages/admin/pedidos/pedidos';
import { ProdutosAdmin } from './pages/admin/produtos/produtos';
import { ProdutoForm } from './pages/admin/produto-form/produto-form';
import { Categorias } from './pages/admin/categorias/categorias';
import { CategoriaForm } from './pages/admin/categoria-form/categoria-form';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'produtos',
    component: Produtos
  },
  {
    path: 'produtos/:id',
    component: ProdutoDetalhe
  },
  {
    path: 'carrinho',
    component: Carrinho
  },
  {
    path: 'checkout',
    component: Checkout
  },
  {
    path: 'admin/login',
    component: Login
  },
  {
    path: 'admin',
    component: Dashboard,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/pedidos',
    component: Pedidos,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/produtos',
    component: ProdutosAdmin,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/produtos/novo',
    component: ProdutoForm,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/produtos/:id/editar',
    component: ProdutoForm,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/categorias',
    component: Categorias,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/categorias/nova',
    component: CategoriaForm,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/categorias/:id/editar',
    component: CategoriaForm,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/relatorios',
    component: Relatorios,
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  },
];