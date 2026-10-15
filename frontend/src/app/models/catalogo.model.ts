export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  estoque: number;
  categoria: number;
  categoria_nome: string;
  imagem_principal: string | null;
  imagens?: ProdutoImagem[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProdutoImagem {
  id: number;
  imagem_url: string;
  thumbnail_url: string | null;
  principal: boolean;
  ordem: number;
  alt_text: string;
}