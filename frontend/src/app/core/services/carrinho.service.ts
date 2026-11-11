
import { Injectable, computed, signal } from '@angular/core';

import { Produto } from '../../models/catalogo.model';
import { ItemCarrinho } from '../../models/carrinho.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {

  private readonly storageKey = 'aroma_store_carrinho';

  private readonly itensSignal = signal<ItemCarrinho[]>(
    this.carregarCarrinho()
  );

  readonly itens = this.itensSignal.asReadonly();

  readonly quantidadeTotal = computed(() =>
    this.itensSignal().reduce(
      (total, item) => total + item.quantidade,
      0
    )
  );

  readonly valorTotal = computed(() =>
    this.itensSignal().reduce(
      (total, item) =>
        total + Number(item.produto.preco) * item.quantidade,
      0
    )
  );

  private carregarCarrinho(): ItemCarrinho[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const dados = localStorage.getItem(this.storageKey);

      if (!dados) {
        return [];
      }

      const itens = JSON.parse(dados) as ItemCarrinho[];

      if (!Array.isArray(itens)) {
        return [];
      }

      return itens.filter(
        item =>
          item?.produto != null &&
          Number.isFinite(Number(item.produto.id)) &&
          Number.isInteger(item.quantidade) &&
          item.quantidade > 0
      );
    } catch {
      return [];
    }
  }

  private atualizarCarrinho(itens: ItemCarrinho[]): void {
    this.itensSignal.set(itens);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(itens)
      );
    }
  }

  adicionarProduto(produto: Produto): void {
    const estoque = Number(produto.estoque);

    if (!Number.isFinite(estoque) || estoque <= 0) {
      console.warn('Produto sem estoque:', produto.nome);
      return;
    }

    const itens = [...this.itensSignal()];

    const itemExistente = itens.find(
      item => item.produto.id === produto.id
    );

    if (itemExistente) {
      if (itemExistente.quantidade < estoque) {
        itemExistente.quantidade++;

        this.atualizarCarrinho([...itens]);
      }
    } else {
      itens.push({
        produto,
        quantidade: 1
      });

      this.atualizarCarrinho(itens);
    }
  }

  aumentarQuantidade(produtoId: number): void {
    const itens = [...this.itensSignal()];

    const item = itens.find(
      item => item.produto.id === produtoId
    );

    if (
      item &&
      item.quantidade < Number(item.produto.estoque)
    ) {
      item.quantidade++;

      this.atualizarCarrinho([...itens]);
    }
  }

  diminuirQuantidade(produtoId: number): void {
    const itens = [...this.itensSignal()];

    const item = itens.find(
      item => item.produto.id === produtoId
    );

    if (!item) {
      return;
    }

    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      const indice = itens.indexOf(item);
      itens.splice(indice, 1);
    }

    this.atualizarCarrinho([...itens]);
  }

  removerProduto(produtoId: number): void {
    this.atualizarCarrinho(
      this.itensSignal().filter(
        item => item.produto.id !== produtoId
      )
    );
  }

  limpar(): void {
    this.atualizarCarrinho([]);
  }
}
