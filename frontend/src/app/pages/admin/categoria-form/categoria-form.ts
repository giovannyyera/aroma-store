import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AdminCategoriasService } from '../../../core/services/admin-categorias.service';

@Component({
  selector: 'app-categoria-form',
  imports: [CommonModule, FormsModule, RouterLink],
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
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.categoriaId = id;
      this.carregarCategoria(id);
    }
  }

  carregarCategoria(id: number): void {
    this.carregando.set(true);

    this.categoriasService.buscar(id).subscribe({
      next: (categoria) => {
        this.nome = categoria.nome;
        this.descricao = categoria.descricao;
        this.ativo = categoria.ativo;

        this.carregando.set(false);
      },

      error: () => {
        this.erro.set('Não foi possível carregar a categoria.');

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
      ativo: this.ativo,
    };

    const requisicao = this.categoriaId
      ? this.categoriasService.atualizar(this.categoriaId, dados)
      : this.categoriasService.criar(dados);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);

        this.router.navigate(['/admin/categorias']);
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

        this.erro.set('Não foi possível salvar a categoria.');
      },
    });
  }
}
