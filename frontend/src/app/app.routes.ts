import { Routes } from '@angular/router';

import { Produtos } from './pages/produtos/produtos';
import { ProdutoDetalhe } from './pages/produto-detalhe/produto-detalhe';
import { Carrinho } from './pages/carrinho/carrinho';
import { Checkout } from './pages/checkout/checkout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'produtos',
    pathMatch: 'full'
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
  }
];