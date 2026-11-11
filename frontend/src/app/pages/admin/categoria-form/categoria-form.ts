
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { AdminCategoriasService } from '../../../core/services/admin-categorias.service';

@Component({
  selector: 'app-categoria-form',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css',
})
export class CategoriaForm implements OnInit {

  categoriaId: number | null = null;

  nome = '';
  descricao = '';
  ativo = true;

  carregando = signal(false);
  salvando = signal(false);
  erro = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriasService: AdminCategoriasService,
  ) {}

  ngOnInit(): void {
    const parametroId = this.route.snapshot.paramMap.get('id');

    if (parametroId === null) {
      return;
    }

    const id = Number(parametroId);

    if (!Number.isInteger(id) || id <= 0) {
      this.erro.set('Identificador da categoria inválido.');
      this.carregando.set(true);
      return;
    }

    this.categoriaId = id;
    this.carregarCategoria(id);
  }

  carregarCategoria(id: number): void {
    this.carregando.set(true);
    this.erro.set('');

    this.categoriasService.buscar(id).subscribe({
      next: (categoria) => {
        this.nome = categoria.nome;
        this.descricao = categoria.descricao || '';
        this.ativo = categoria.ativo;

        this.carregando.set(false);
      },

      error: () => {
        this.erro.set(
          'Não foi possível carregar a categoria.'
        );

        this.carregando.set(false);
      },
    });
  }

  salvar(): void {

    if (this.salvando() || this.carregando()) {
      return;
    }

    this.erro.set('');

    const nomeLimpo = this.nome.trim();

    if (!nomeLimpo) {
      this.erro.set(
        'Informe o nome da categoria.'
      );
      return;
    }

    if (nomeLimpo.length > 120) {
      this.erro.set(
        'O nome da categoria deve ter no máximo 120 caracteres.'
      );
      return;
    }

    const dados = {
      nome: nomeLimpo,
      descricao: this.descricao.trim(),
      ativo: this.ativo,
    };

    this.salvando.set(true);

    const requisicao = this.categoriaId !== null
      ? this.categoriasService.atualizar(
          this.categoriaId,
          dados
        )
      : this.categoriasService.criar(dados);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);

        this.router.navigate([
          '/admin/categorias'
        ]);
      },

      error: (erro) => {
        this.salvando.set(false);

        console.error(
          'Erro ao salvar categoria:',
          erro
        );

        const dadosErro = erro.error;

        if (erro.status === 0) {
          this.erro.set(
            'Não foi possível conectar ao servidor.'
          );
          return;
        }

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
              this.erro.set(
                String(mensagens[0])
              );
              return;
            }

            if (typeof mensagens === 'string') {
              this.erro.set(mensagens);
              return;
            }
          }
        }

        this.erro.set(
          'Não foi possível salvar a categoria. Tente novamente.'
        );
      },
    });
  }
}
