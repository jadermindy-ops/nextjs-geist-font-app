export interface Produto {
  id: string;
  nome: string;
  codigo: string;
  tamanho: string;
  cor: string;
  quantidade: number;
  estoqueMinimo: number;
  ultimaMovimentacao: Date;
}

export interface Movimentacao {
  id: string;
  produtoId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: Date;
  observacoes?: string;
}

export interface EstoqueData {
  produtos: Record<string, Produto>;
  movimentacoes: Movimentacao[];
}

export interface OCRResult {
  success: boolean;
  data?: {
    codigo?: string;
    nome?: string;
    quantidade?: number;
    tamanho?: string;
    cor?: string;
  };
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  tipo?: 'entrada' | 'saida' | 'todos';
  format: 'excel' | 'pdf';
}

export interface ReportData {
  movimentacoes: Movimentacao[];
  produtos: Record<string, Produto>;
  filtros: ReportFilter;
  estatisticas: {
    totalMovimentacoes: number;
    totalEntradas: number;
    totalSaidas: number;
    periodoInicio: string;
    periodoFim: string;
  };
}
