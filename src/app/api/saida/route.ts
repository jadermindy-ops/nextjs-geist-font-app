import { NextRequest, NextResponse } from 'next/server';
import { getInventoryManager } from '@/lib/inventory';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { codigo, quantidade = 1 } = body;

    if (!codigo) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Código de barras é obrigatório'
      }, { status: 400 });
    }

    if (typeof quantidade !== 'number' || quantidade <= 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Quantidade deve ser um número positivo'
      }, { status: 400 });
    }

    const inventoryManager = getInventoryManager();
    
    // Verificar se o produto existe
    const produto = inventoryManager.getProduct(codigo);
    if (!produto) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Produto não encontrado no estoque'
      }, { status: 404 });
    }

    // Tentar remover do estoque
    const result = inventoryManager.removeStock(codigo, quantidade);

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.message
      }, { status: 400 });
    }

    // Verificar se precisa de alerta de estoque baixo
    const isLowStock = result.novoEstoque !== undefined && result.novoEstoque <= produto.estoqueMinimo;
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: result.message,
      data: {
        produto: {
          ...produto,
          quantidade: result.novoEstoque
        },
        alertaEstoqueBaixo: isLowStock,
        estoqueAtual: result.novoEstoque
      }
    });

  } catch (error) {
    console.error('Erro no endpoint de saída:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Endpoint GET para buscar informações de um produto
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');

    if (!codigo) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Código de barras é obrigatório'
      }, { status: 400 });
    }

    const inventoryManager = getInventoryManager();
    const produto = inventoryManager.getProduct(codigo);

    if (!produto) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: produto
    });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
