
import {
  Component,
  OnInit,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { CatalogoService } from '../../core/services/catalogo.service';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { Produto } from '../../models/catalogo.model';

@Component({
  selector: 'app-produto-detalhe',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.css'
})
export class ProdutoDetalhe implements OnInit {

  // Dados do produto
  produto = signal<Produto | null>(null);
  carregando = signal(true);
  erro = signal('');
  indiceImagem = signal(0);
  quantidade = signal(1);
  mensagem = signal('');
  menuOpen = false;
  searchOpen = false;
  searchTerm = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogoService: CatalogoService,
    public carrinhoService: CarrinhoService
  ) {}

  

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  submitSearch(): void {
    const term = this.searchTerm.trim();

    if (!term) return;

    console.log('Pesquisa:', term);
  }

  // Contador do header
  get cartCount(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  // Imagem selecionada na galeria
  imagemSelecionada = computed(() => {
    const produto = this.produto();

    if (!produto) {
      return null;
    }

    const imagens = produto.imagens ?? [];

    if (imagens.length > 0) {
      return (
        imagens[this.indiceImagem()]?.imagem_url ??
        imagens[0].imagem_url
      );
    }

    return produto.imagem_principal || null;
  });

  // Quantidade deste produto já presente no carrinho
  quantidadeNoCarrinho = computed(() => {
    const produto = this.produto();

    if (!produto) {
      return 0;
    }

    const item = this.carrinhoService.itens().find(
      item => item.produto.id === produto.id
    );

    return item?.quantidade ?? 0;
  });

  // Quantidade que ainda pode ser adicionada
  quantidadeDisponivel = computed(() => {
    const produto = this.produto();

    if (!produto) {
      return 0;
    }

    return Math.max(
      0,
      Number(produto.estoque) - this.quantidadeNoCarrinho()
    );
  });

  produtoEsgotado = computed(() => {
  const produto = this.produto();

  return !produto || Number(produto.estoque) <= 0;
});

limiteNoCarrinho = computed(() => {
  return !this.produtoEsgotado() &&
    this.quantidadeDisponivel() <= 0;
});

  // Subtotal da seleção
  subtotal = computed(() => {
    const produto = this.produto();

    if (!produto) {
      return 0;
    }

    return Number(produto.preco) * this.quantidade();
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        this.produto.set(null);
        this.erro.set('Produto inválido.');
        this.carregando.set(false);
        return;
      }

      this.carregarProduto(id);
    });
  }

  // Buscar produto no Django
  carregarProduto(id: number): void {
    this.carregando.set(true);
    this.erro.set('');
    this.mensagem.set('');
    this.produto.set(null);

    this.catalogoService.buscarProduto(id).subscribe({
      next: produto => {
        this.produto.set(produto);

        this.indiceImagem.set(0);
        this.quantidade.set(1);

        this.carregando.set(false);
      },

      error: () => {
        this.erro.set('Produto não encontrado.');
        this.carregando.set(false);
      }
    });
  }

  // Trocar imagem principal
  selecionarImagem(index: number): void {
    this.indiceImagem.set(index);
  }

  // Aumentar quantidade
  aumentarQuantidade(): void {
    if (this.quantidade() < this.quantidadeDisponivel()) {
      this.quantidade.update(valor => valor + 1);
    }
  }

  // Diminuir quantidade
  diminuirQuantidade(): void {
    if (this.quantidade() > 1) {
      this.quantidade.update(valor => valor - 1);
    }
  }

  // Adicionar a quantidade selecionada
  private adicionarSelecionados(): boolean {
    const produto = this.produto();

    if (!produto) {
      return false;
    }

    const disponivel = this.quantidadeDisponivel();

    if (disponivel <= 0) {
      return false;
    }

    const quantidadeAdicionar = Math.min(
      this.quantidade(),
      disponivel
    );

    for (let i = 0; i < quantidadeAdicionar; i++) {
      this.carrinhoService.adicionarProduto(produto);
    }

    this.quantidade.set(1);

    return true;
  }

  // Adicionar ao carrinho sem sair da página
  adicionarAoCarrinho(): void {
    const quantidadeAdicionada = Math.min(
      this.quantidade(),
      this.quantidadeDisponivel()
    );

    if (this.adicionarSelecionados()) {
      this.mensagem.set(
        quantidadeAdicionada === 1
          ? 'Produto adicionado ao carrinho!'
          : `${quantidadeAdicionada} unidades adicionadas ao carrinho!`
      );
    }
  }

  // Adicionar e ir para o checkout
  comprarAgora(): void {
    if (this.adicionarSelecionados()) {
      this.router.navigate(['/checkout']);
    }
  }
}
