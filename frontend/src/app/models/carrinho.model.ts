import { Produto } from './catalogo.model';

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}