import { NextResponse } from 'next/server';
import { getInventoryManager } from '@/lib/inventory';
import { ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    const inventoryManager = getInventoryManager();
    
    const produtos = inventoryManager.getAllProducts();
    const alertasEstoqueBaixo = inventoryManager.getLowStockAlerts();
    const movimentacoesRecentes = inventoryManager.getRecentMovements(10);
    
    const estatisticas = {
      totalProdutos: inventoryManager.getTotalProducts(),
      totalEstoque: inventoryManager.getTotalStock(),
      produtosComEstoqueBaixo: alertasEstoqueBaixo.length,
      ultimasMovimentacoes: movimentacoesRecentes.length
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        produtos,
        alertasEstoqueBaixo,
        movimentacoesRecentes,
        estatisticas
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
