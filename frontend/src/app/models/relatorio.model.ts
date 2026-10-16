export interface ResumoGeral {
  total_pedidos: number;
  pedidos_pendentes: number;
  pedidos_confirmados: number;
  pedidos_concluidos: number;
  pedidos_cancelados: number;
  faturamento_realizado: string;
}

export interface ProdutoVendido {
  produto_id: number;
  produto_nome: string;
  categoria_nome: string;
  quantidade_vendida: number;
  faturamento: string;
}

export interface CategoriaVendas {
  categoria_id: number;
  categoria_nome: string;
  quantidade_vendida: number;
  faturamento: string;
}

export interface LinhaPivot {
  categoria: string;
  meses: Record<string, number>;
  total: number;
}

export interface VendasMensaisPivot {
  colunas: string[];
  linhas: LinhaPivot[];
}