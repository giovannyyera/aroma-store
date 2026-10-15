export interface ItemCheckout {
  produto_id: number;
  quantidade: number;
}

export interface CheckoutPayload {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacao: string;
  itens: ItemCheckout[];
}

export interface ItemPedidoResposta {
  produto: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: string;
  subtotal: number;
}

export interface PedidoResposta {
  id: number;
  status: string;
  observacao: string;
  criado_em: string;
  itens: ItemPedidoResposta[];
  total: number;
  whatsapp_mensagem: string;
  whatsapp_url: string;
}