export interface AdminProduto {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  estoque: number;

  categoria: number;
  categoria_nome: string;

  ativo: boolean;
  criado_em: string;

  imagem_principal: string | null;
}

export interface AdminProdutoImagem {
  id: number;
  imagem_url: string;
  thumbnail_url: string | null;
  principal: boolean;
  ordem: number;
  alt_text: string;
}