import { Produto, Movimentacao, EstoqueData } from '@/types';

const STORAGE_KEY = 'uniform_inventory';

class InventoryManager {
  private data: EstoqueData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): EstoqueData {
    if (typeof window === 'undefined') {
      return { produtos: {}, movimentacoes: [] };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter strings de data de volta para objetos Date
        Object.values(parsed.produtos).forEach((produto: any) => {
          produto.ultimaMovimentacao = new Date(produto.ultimaMovimentacao);
        });
        parsed.movimentacoes.forEach((mov: any) => {
          mov.data = new Date(mov.data);
        });
        return parsed;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error);
    }

    return { produtos: {}, movimentacoes: [] };
  }

  private saveData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Erro ao salvar dados do estoque:', error);
    }
  }

  addStock(codigo: string, quantidade: number, dadosProduto?: Partial<Produto>): boolean {
    try {
      const agora = new Date();
      
      if (this.data.produtos[codigo]) {
        // Produto já existe, apenas adiciona quantidade
        this.data.produtos[codigo].quantidade += quantidade;
        this.data.produtos[codigo].ultimaMovimentacao = agora;
      } else {
        // Novo produto
        const novoProduto: Produto = {
          id: codigo,
          nome: dadosProduto?.nome || `Uniforme ${codigo}`,
          codigo,
          tamanho: dadosProduto?.tamanho || 'M',
          cor: dadosProduto?.cor || 'Azul',
          quantidade,
          estoqueMinimo: 10,
          ultimaMovimentacao: agora
        };
        this.data.produtos[codigo] = novoProduto;
      }

      // Registra movimentação
      const movimentacao: Movimentacao = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        produtoId: codigo,
        tipo: 'entrada',
        quantidade,
        data: agora,
        observacoes: 'Entrada via nota fiscal'
      };
      this.data.movimentacoes.push(movimentacao);

      this.saveData();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar estoque:', error);
      return false;
    }
  }

  removeStock(codigo: string, quantidade: number = 1): { success: boolean; message: string; novoEstoque?: number } {
    try {
      const produto = this.data.produtos[codigo];
      
      if (!produto) {
        return { success: false, message: 'Produto não encontrado no estoque' };
      }

      if (produto.quantidade < quantidade) {
        return { 
          success: false, 
          message: `Estoque insuficiente. Disponível: ${produto.quantidade} unidades` 
        };
      }

      // Remove do estoque
      produto.quantidade -= quantidade;
      produto.ultimaMovimentacao = new Date();

      // Registra movimentação
      const movimentacao: Movimentacao = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        produtoId: codigo,
        tipo: 'saida',
        quantidade,
        data: new Date(),
        observacoes: 'Saída via código de barras'
      };
      this.data.movimentacoes.push(movimentacao);

      this.saveData();

      let message = `Saída registrada. Estoque atual: ${produto.quantidade} unidades`;
      if (produto.quantidade <= produto.estoqueMinimo) {
        message += ` ⚠️ ALERTA: Estoque baixo!`;
      }

      return { 
        success: true, 
        message, 
        novoEstoque: produto.quantidade 
      };
    } catch (error) {
      console.error('Erro ao remover estoque:', error);
      return { success: false, message: 'Erro interno do sistema' };
    }
  }

  getStock(codigo: string): number {
    return this.data.produtos[codigo]?.quantidade || 0;
  }

  getProduct(codigo: string): Produto | null {
    return this.data.produtos[codigo] || null;
  }

  getAllProducts(): Produto[] {
    return Object.values(this.data.produtos);
  }

  getLowStockAlerts(): Produto[] {
    return Object.values(this.data.produtos).filter(
      produto => produto.quantidade <= produto.estoqueMinimo
    );
  }

  getRecentMovements(limit: number = 10): Movimentacao[] {
    return this.data.movimentacoes
      .sort((a, b) => b.data.getTime() - a.data.getTime())
      .slice(0, limit);
  }

  getMovementsByFilter(filter: {
    startDate?: Date;
    endDate?: Date;
    tipo?: 'entrada' | 'saida';
  }): Movimentacao[] {
    let filteredMovements = [...this.data.movimentacoes];

    // Filtrar por data de início
    if (filter.startDate) {
      filteredMovements = filteredMovements.filter(
        mov => mov.data >= filter.startDate!
      );
    }

    // Filtrar por data de fim
    if (filter.endDate) {
      // Adicionar 23:59:59 à data de fim para incluir todo o dia
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filteredMovements = filteredMovements.filter(
        mov => mov.data <= endDate
      );
    }

    // Filtrar por tipo
    if (filter.tipo) {
      filteredMovements = filteredMovements.filter(
        mov => mov.tipo === filter.tipo
      );
    }

    // Ordenar por data (mais recente primeiro)
    return filteredMovements.sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  getAllMovements(): Movimentacao[] {
    return this.data.movimentacoes.sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  getTotalProducts(): number {
    return Object.keys(this.data.produtos).length;
  }

  getTotalStock(): number {
    return Object.values(this.data.produtos).reduce((total, produto) => total + produto.quantidade, 0);
  }
}

// Singleton instance
let inventoryManager: InventoryManager | null = null;

export function getInventoryManager(): InventoryManager {
  if (!inventoryManager) {
    inventoryManager = new InventoryManager();
  }
  return inventoryManager;
}

export default InventoryManager;
