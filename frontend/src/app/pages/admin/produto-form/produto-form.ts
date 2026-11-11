
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { AdminProdutosService } from '../../../core/services/admin-produtos.service';
import { CatalogoService } from '../../../core/services/catalogo.service';

import { Categoria } from '../../../models/catalogo.model';
import { AdminProdutoImagem } from '../../../models/admin-produto.model';

@Component({
  selector: 'app-produto-form',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
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
  sucesso = signal('');
  imagens = signal<AdminProdutoImagem[]>([]);
  arquivoSelecionado: File | null = null;
  imagemPrincipal = false;
  imagemOrdem = 0;
  imagemAltText = '';
  enviandoImagem = signal(false);
  imagemAtualizando = signal<number | null>(null);

  readonly tamanhoMaximoImagem = 5 * 1024 * 1024;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtosService: AdminProdutosService,
    private catalogoService: CatalogoService,
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();

    const parametroId = this.route.snapshot.paramMap.get('id');

    if (parametroId === null) {
      return;
    }

    const id = Number(parametroId);

    if (!Number.isInteger(id) || id <= 0) {
      this.erro.set('Identificador de produto inválido.');
      this.carregando.set(true);
      return;
    }

    this.produtoId = id;
    this.carregarProduto(id);
    this.carregarImagens(id);
  }


  carregarCategorias(): void {
    this.catalogoService.listarCategorias().subscribe({
      next: dados => {
        this.categorias.set(dados);
      },

      error: () => {
        this.erro.set(
          'Não foi possível carregar as categorias.'
        );
      }
    });
  }


  carregarProduto(id: number): void {
    this.carregando.set(true);
    this.erro.set('');

    this.produtosService.buscar(id).subscribe({
      next: produto => {
        this.nome = produto.nome;
        this.descricao = produto.descricao || '';
        this.preco = Number(produto.preco);
        this.estoque = produto.estoque;
        this.categoria = produto.categoria;
        this.ativo = produto.ativo;

        this.carregando.set(false);
      },

      error: () => {
        this.erro.set(
          'Não foi possível carregar o produto.'
        );
        this.carregando.set(false);
      }
    });
  }


  private validarProduto(): boolean {

    if (!this.nome.trim()) {
      this.erro.set('Informe o nome do produto.');
      return false;
    }

    if (!Number.isFinite(this.preco) || this.preco <= 0) {
      this.erro.set(
        'Informe um preço válido maior que zero.'
      );
      return false;
    }

    if (
      !Number.isInteger(this.estoque) ||
      this.estoque < 0
    ) {
      this.erro.set(
        'O estoque deve ser um número inteiro maior ou igual a zero.'
      );
      return false;
    }

    if (
      !Number.isInteger(this.categoria) ||
      this.categoria <= 0
    ) {
      this.erro.set('Selecione uma categoria.');
      return false;
    }

    return true;
  }


  salvar(): void {

    if (this.salvando() || this.carregando()) {
      return;
    }

    this.erro.set('');
    this.sucesso.set('');

    if (!this.validarProduto()) {
      return;
    }

    const dados = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim(),
      preco: this.preco,
      estoque: this.estoque,
      categoria: this.categoria,
      ativo: this.ativo,
    };

    this.salvando.set(true);

    const requisicao = this.produtoId !== null
      ? this.produtosService.atualizar(this.produtoId, dados)
      : this.produtosService.criar(dados);

    requisicao.subscribe({
      next: (produto) => {
        this.salvando.set(false);

        if (this.produtoId === null) {
          this.router.navigate([
            '/admin/produtos',
            produto.id,
            'editar'
          ]).then(navegou => {
            if (!navegou) {
              this.erro.set(
                'Produto cadastrado, mas não foi possível abrir a edição.'
              );
            }
          });

          return;
        }

        this.sucesso.set(
          'Produto atualizado com sucesso!'
        );

        this.router.navigate(['/admin/produtos']);
      },

      error: erro => {
        this.salvando.set(false);
        this.tratarErro(
          erro,
          'Não foi possível salvar o produto.'
        );
      }
    });
  }


  carregarImagens(produtoId: number): void {
    this.produtosService.listarImagens(produtoId).subscribe({
      next: dados => {
        this.imagens.set(dados);
      },

      error: () => {
        this.erro.set(
          'Não foi possível carregar as imagens do produto.'
        );
      }
    });
  }


  selecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    this.erro.set('');

    if (!arquivo) {
      this.arquivoSelecionado = null;
      return;
    }

    const formatosPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!formatosPermitidos.includes(arquivo.type)) {
      this.erro.set(
        'Selecione uma imagem JPG, PNG ou WebP.'
      );
      this.arquivoSelecionado = null;
      input.value = '';
      return;
    }

    if (arquivo.size > this.tamanhoMaximoImagem) {
      this.erro.set(
        'A imagem deve ter no máximo 5 MB.'
      );
      this.arquivoSelecionado = null;
      input.value = '';
      return;
    }

    this.arquivoSelecionado = arquivo;
  }


  enviarImagem(): void {

    if (this.enviandoImagem()) {
      return;
    }

    if (
      this.produtoId === null ||
      this.arquivoSelecionado === null
    ) {
      this.erro.set('Selecione uma imagem.');
      return;
    }

    if (
      !Number.isInteger(this.imagemOrdem) ||
      this.imagemOrdem < 0
    ) {
      this.erro.set(
        'Informe uma ordem válida para a imagem.'
      );
      return;
    }

    this.erro.set('');
    this.sucesso.set('');
    this.enviandoImagem.set(true);

    const id = this.produtoId;

    this.produtosService.enviarImagem(
      id,
      this.arquivoSelecionado,
      this.imagemPrincipal,
      this.imagemOrdem,
      this.imagemAltText.trim()
    ).subscribe({
      next: () => {
        this.enviandoImagem.set(false);

        this.arquivoSelecionado = null;
        this.imagemPrincipal = false;
        this.imagemOrdem = 0;
        this.imagemAltText = '';

        const input = document.getElementById(
          'imagem-arquivo'
        ) as HTMLInputElement | null;

        if (input) {
          input.value = '';
        }

        this.sucesso.set(
          'Imagem enviada com sucesso!'
        );

        this.carregarImagens(id);
      },

      error: erro => {
        this.enviandoImagem.set(false);
        this.tratarErro(
          erro,
          'Não foi possível enviar a imagem.'
        );
      }
    });
  }


  tornarPrincipal(imagem: AdminProdutoImagem): void {

    if (
      this.produtoId === null ||
      this.imagemAtualizando() !== null
    ) {
      return;
    }

    this.erro.set('');
    this.imagemAtualizando.set(imagem.id);

    const id = this.produtoId;

    this.produtosService.atualizarImagem(
      id,
      imagem.id,
      { principal: true }
    ).subscribe({
      next: () => {
        this.imagemAtualizando.set(null);
        this.sucesso.set(
          'Imagem principal atualizada!'
        );
        this.carregarImagens(id);
      },

      error: erro => {
        this.imagemAtualizando.set(null);
        this.tratarErro(
          erro,
          'Não foi possível alterar a imagem principal.'
        );
      }
    });
  }


  alterarOrdem(
    imagem: AdminProdutoImagem,
    novaOrdem: number
  ): void {

    if (
      this.produtoId === null ||
      this.imagemAtualizando() !== null
    ) {
      return;
    }

    if (
      !Number.isInteger(novaOrdem) ||
      novaOrdem < 0
    ) {
      this.erro.set(
        'A ordem da imagem deve ser um número inteiro válido.'
      );
      return;
    }

    this.erro.set('');
    this.imagemAtualizando.set(imagem.id);

    const id = this.produtoId;

    this.produtosService.atualizarImagem(
      id,
      imagem.id,
      { ordem: novaOrdem }
    ).subscribe({
      next: () => {
        this.imagemAtualizando.set(null);
        this.carregarImagens(id);
      },

      error: erro => {
        this.imagemAtualizando.set(null);
        this.tratarErro(
          erro,
          'Não foi possível alterar a ordem da imagem.'
        );
      }
    });
  }

  excluirImagem(imagem: AdminProdutoImagem): void {

    if (
      this.produtoId === null ||
      this.imagemAtualizando() !== null
    ) {
      return;
    }

    const confirmar = window.confirm(
      'Deseja realmente excluir esta imagem?'
    );

    if (!confirmar) {
      return;
    }

    const id = this.produtoId;

    this.erro.set('');
    this.imagemAtualizando.set(imagem.id);

    this.produtosService.excluirImagem(
      id,
      imagem.id
    ).subscribe({
      next: () => {
        this.imagemAtualizando.set(null);
        this.sucesso.set(
          'Imagem excluída com sucesso.'
        );
        this.carregarImagens(id);
      },

      error: erro => {
        this.imagemAtualizando.set(null);
        this.tratarErro(
          erro,
          'Não foi possível excluir a imagem.'
        );
      }
    });
  }

  private tratarErro(
    erro: any,
    mensagemPadrao: string
  ): void {

    console.error('Erro administrativo:', erro);

    if (erro.status === 0) {
      this.erro.set(
        'Não foi possível conectar ao servidor.'
      );
      return;
    }

    const dadosErro = erro.error;

    if (
      dadosErro &&
      typeof dadosErro.detail === 'string'
    ) {
      this.erro.set(dadosErro.detail);
      return;
    }

    if (
      dadosErro &&
      typeof dadosErro === 'object'
    ) {
      const campo = Object.keys(dadosErro)[0];

      if (campo) {
        const mensagens = dadosErro[campo];

        if (
          Array.isArray(mensagens) &&
          mensagens.length > 0
        ) {
          this.erro.set(String(mensagens[0]));
          return;
        }

        if (typeof mensagens === 'string') {
          this.erro.set(mensagens);
          return;
        }
      }
    }

    this.erro.set(mensagemPadrao);
  }
}
