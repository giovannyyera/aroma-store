export interface AdminItemPedido {
  produto: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: string;
  subtotal: number;
}

export interface AdminPedido {
  id: number;
  cliente: number;
  cliente_nome: string;
  cliente_telefone: string;
  status: string;
  observacao: string;
  criado_em: string;
  atualizado_em: string;
  itens: AdminItemPedido[];
  total: number;
}