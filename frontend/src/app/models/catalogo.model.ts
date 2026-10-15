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
}