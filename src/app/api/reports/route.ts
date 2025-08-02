import { NextRequest, NextResponse } from 'next/server';
import { getInventoryManager } from '@/lib/inventory';
import { ReportGenerator } from '@/lib/report-generator';
import { ReportData, ReportFilter } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrair parâmetros da query
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const tipoParam = searchParams.get('tipo') as 'entrada' | 'saida' | 'todos';
    const formatParam = searchParams.get('format') as 'excel' | 'pdf';

    // Validar parâmetros obrigatórios
    if (!formatParam || !['excel', 'pdf'].includes(formatParam)) {
      return NextResponse.json({
        success: false,
        error: 'Formato inválido. Use "excel" ou "pdf"'
      }, { status: 400 });
    }

    // Preparar filtros
    const filtros: ReportFilter = {
      startDate: startDateParam || undefined,
      endDate: endDateParam || undefined,
      tipo: tipoParam || 'todos',
      format: formatParam
    };

    // Obter dados do inventário
    const inventoryManager = getInventoryManager();
    
    // Preparar filtro para o InventoryManager
    const filterForManager: {
      startDate?: Date;
      endDate?: Date;
      tipo?: 'entrada' | 'saida';
    } = {};

    if (filtros.startDate) {
      filterForManager.startDate = new Date(filtros.startDate);
    }
    
    if (filtros.endDate) {
      filterForManager.endDate = new Date(filtros.endDate);
    }
    
    if (filtros.tipo && filtros.tipo !== 'todos') {
      filterForManager.tipo = filtros.tipo;
    }

    // Obter movimentações filtradas
    const movimentacoes = inventoryManager.getMovementsByFilter(filterForManager);
    const produtos = inventoryManager.getAllProducts();
    const produtosMap = produtos.reduce((acc, produto) => {
      acc[produto.id] = produto;
      return acc;
    }, {} as Record<string, any>);

    // Calcular estatísticas
    const totalEntradas = movimentacoes.filter(m => m.tipo === 'entrada').length;
    const totalSaidas = movimentacoes.filter(m => m.tipo === 'saida').length;
    
    // Determinar período
    let periodoInicio = 'Início dos registros';
    let periodoFim = 'Fim dos registros';
    
    if (movimentacoes.length > 0) {
      const datasOrdenadas = movimentacoes
        .map(m => m.data)
        .sort((a, b) => a.getTime() - b.getTime());
      
      periodoInicio = filtros.startDate || datasOrdenadas[0].toLocaleDateString('pt-BR');
      periodoFim = filtros.endDate || datasOrdenadas[datasOrdenadas.length - 1].toLocaleDateString('pt-BR');
    }

    // Preparar dados do relatório
    const reportData: ReportData = {
      movimentacoes,
      produtos: produtosMap,
      filtros,
      estatisticas: {
        totalMovimentacoes: movimentacoes.length,
        totalEntradas,
        totalSaidas,
        periodoInicio,
        periodoFim
      }
    };

    // Gerar relatório
    const reportGenerator = new ReportGenerator(reportData);
    let buffer: ArrayBuffer;
    let mimeType: string;
    let filename: string;

    if (formatParam === 'excel') {
      buffer = reportGenerator.generateExcel();
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = ReportGenerator.getFileName('excel', filtros);
    } else {
      buffer = reportGenerator.generatePDF();
      mimeType = 'application/pdf';
      filename = ReportGenerator.getFileName('pdf', filtros);
    }

    // Retornar arquivo
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor ao gerar relatório'
    }, { status: 500 });
  }
}
