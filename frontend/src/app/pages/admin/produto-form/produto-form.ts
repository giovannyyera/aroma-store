import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AdminProdutosService } from '../../../core/services/admin-produtos.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { Categoria } from '../../../models/catalogo.model';
import { AdminProdutoImagem } from '../../../models/admin-produto.model';

@Component({
  selector: 'app-produto-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css',
})
export class ProdutoForm implements OnInit {
  produtoId: number | null = null;

  nome = '';
  descricao = '';
  preco = 0;
  estoque = 0;
  categoria = 0;
  ativo = true;

  categorias = signal<Categoria[]>([]);

  carregando = signal(false);
  salvando = signal(false);
  erro = signal('');

  imagens = signal<AdminProdutoImagem[]>([]);

  arquivoSelecionado: File | null = null;
  imagemPrincipal = false;
  imagemOrdem = 0;
  imagemAltText = '';

  enviandoImagem = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtosService: AdminProdutosService,
    private catalogoService: CatalogoService,
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.produtoId = id;
      this.carregarProduto(id);
      this.carregarImagens(id);
    }
  }

  carregarCategorias(): void {
    this.catalogoService.listarCategorias().subscribe({
      next: (dados) => {
        this.categorias.set(dados);
      },
    });
  }

  carregarProduto(id: number): void {
    this.carregando.set(true);

    this.produtosService.buscar(id).subscribe({
      next: (produto) => {
        this.nome = produto.nome;
        this.descricao = produto.descricao;
        this.preco = Number(produto.preco);
        this.estoque = produto.estoque;
        this.categoria = produto.categoria;
        this.ativo = produto.ativo;

        this.carregando.set(false);
      },

      error: () => {
        this.erro.set('Não foi possível carregar o produto.');

        this.carregando.set(false);
      },
    });
  }

  salvar(): void {
    this.erro.set('');
    this.salvando.set(true);

    const dados = {
      nome: this.nome,
      descricao: this.descricao,
      preco: this.preco,
      estoque: this.estoque,
      categoria: this.categoria,
      ativo: this.ativo,
    };

    const requisicao = this.produtoId
      ? this.produtosService.atualizar(this.produtoId, dados)
      : this.produtosService.criar(dados);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);

        this.router.navigate(['/admin/produtos']);
      },

      error: (erro) => {
        this.salvando.set(false);

        const dadosErro = erro.error;

        if (dadosErro && typeof dadosErro === 'object') {
          const campo = Object.keys(dadosErro)[0];
          const mensagens = dadosErro[campo];

          if (Array.isArray(mensagens) && mensagens.length > 0) {
            this.erro.set(mensagens[0]);
            return;
          }
        }

        this.erro.set('Não foi possível salvar o produto.');
      },
    });
  }

  carregarImagens(produtoId: number): void {
    this.produtosService.listarImagens(produtoId).subscribe({
      next: (dados) => {
        this.imagens.set(dados);
      },
    });
  }

  selecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.arquivoSelecionado = input.files[0];
    }
  }

  enviarImagem(): void {
    if (!this.produtoId || !this.arquivoSelecionado) {
      this.erro.set('Selecione uma imagem.');

      return;
    }

    this.enviandoImagem.set(true);
    this.erro.set('');

    this.produtosService
      .enviarImagem(
        this.produtoId,
        this.arquivoSelecionado,
        this.imagemPrincipal,
        this.imagemOrdem,
        this.imagemAltText,
      )
      .subscribe({
        next: () => {
          this.enviandoImagem.set(false);

          this.arquivoSelecionado = null;
          this.imagemPrincipal = false;
          this.imagemOrdem = 0;
          this.imagemAltText = '';

          this.carregarImagens(this.produtoId!);
        },

        error: (erro) => {
          this.enviandoImagem.set(false);

          const dadosErro = erro.error;

          if (dadosErro && typeof dadosErro === 'object') {
            const campo = Object.keys(dadosErro)[0];

            const mensagens = dadosErro[campo];

            if (Array.isArray(mensagens) && mensagens.length > 0) {
              this.erro.set(mensagens[0]);

              return;
            }
          }

          this.erro.set('Não foi possível enviar a imagem.');
        },
      });
  }

  tornarPrincipal(imagem: AdminProdutoImagem): void {
    if (!this.produtoId) {
      return;
    }

    this.produtosService
      .atualizarImagem(this.produtoId, imagem.id, {
        principal: true,
      })
      .subscribe({
        next: () => {
          this.carregarImagens(this.produtoId!);
        },
      });
  }

  alterarOrdem(imagem: AdminProdutoImagem, novaOrdem: number): void {
    if (!this.produtoId) {
      return;
    }

    this.produtosService
      .atualizarImagem(this.produtoId, imagem.id, {
        ordem: novaOrdem,
      })
      .subscribe({
        next: () => {
          this.carregarImagens(this.produtoId!);
        },
      });
  }

  excluirImagem(imagem: AdminProdutoImagem): void {
    if (!this.produtoId) {
      return;
    }

    const confirmar = window.confirm('Deseja realmente excluir esta imagem?');

    if (!confirmar) {
      return;
    }

    this.produtosService.excluirImagem(this.produtoId, imagem.id).subscribe({
      next: () => {
        this.carregarImagens(this.produtoId!);
      },
    });
  }
}
