import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdminProduto, AdminProdutoImagem } from '../../models/admin-produto.model';

@Injectable({
  providedIn: 'root',
})
export class AdminProdutosService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/admin/produtos';

  constructor(private http: HttpClient) {}

  listar(busca = '', ativo = ''): Observable<AdminProduto[]> {
    const params = new URLSearchParams();

    if (busca) {
      params.set('busca', busca);
    }

    if (ativo) {
      params.set('ativo', ativo);
    }

    const query = params.toString();

    return this.http.get<AdminProduto[]>(query ? `${this.apiUrl}/?${query}` : `${this.apiUrl}/`);
  }

  ativar(id: number): Observable<AdminProduto> {
    return this.http.post<AdminProduto>(`${this.apiUrl}/${id}/ativar/`, {});
  }

  desativar(id: number): Observable<AdminProduto> {
    return this.http.post<AdminProduto>(`${this.apiUrl}/${id}/desativar/`, {});
  }

  buscar(id: number): Observable<AdminProduto> {
    return this.http.get<AdminProduto>(`${this.apiUrl}/${id}/`);
  }

  criar(dados: {
    nome: string;
    descricao: string;
    preco: number;
    estoque: number;
    categoria: number;
    ativo: boolean;
  }): Observable<AdminProduto> {
    return this.http.post<AdminProduto>(`${this.apiUrl}/`, dados);
  }

  atualizar(
    id: number,
    dados: {
      nome: string;
      descricao: string;
      preco: number;
      estoque: number;
      categoria: number;
      ativo: boolean;
    },
  ): Observable<AdminProduto> {
    return this.http.patch<AdminProduto>(`${this.apiUrl}/${id}/`, dados);
  }

  listarImagens(produtoId: number): Observable<AdminProdutoImagem[]> {
    return this.http.get<AdminProdutoImagem[]>(`${this.apiUrl}/${produtoId}/imagens/`);
  }

  enviarImagem(
    produtoId: number,
    arquivo: File,
    principal: boolean,
    ordem: number,
    altText: string,
  ): Observable<AdminProdutoImagem> {
    const formData = new FormData();

    formData.append('imagem', arquivo);
    formData.append('principal', String(principal));
    formData.append('ordem', String(ordem));
    formData.append('alt_text', altText);

    return this.http.post<AdminProdutoImagem>(`${this.apiUrl}/${produtoId}/imagens/`, formData);
  }

  atualizarImagem(
    produtoId: number,
    imagemId: number,
    dados: {
      principal?: boolean;
      ordem?: number;
      alt_text?: string;
    },
  ): Observable<AdminProdutoImagem> {
    const formData = new FormData();

    if (dados.principal !== undefined) {
      formData.append('principal', String(dados.principal));
    }

    if (dados.ordem !== undefined) {
      formData.append('ordem', String(dados.ordem));
    }

    if (dados.alt_text !== undefined) {
      formData.append('alt_text', dados.alt_text);
    }

    return this.http.patch<AdminProdutoImagem>(
      `${this.apiUrl}/${produtoId}/imagens/${imagemId}/`,
      formData,
    );
  }

  excluirImagem(produtoId: number, imagemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${produtoId}/imagens/${imagemId}/`);
  }
}
