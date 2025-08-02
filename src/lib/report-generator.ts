import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData, Movimentacao, Produto } from '@/types';

export class ReportGenerator {
  private data: ReportData;

  constructor(data: ReportData) {
    this.data = data;
  }

  generateExcel(): ArrayBuffer {
    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Preparar dados das movimentações
    const movimentacoesData = this.data.movimentacoes.map(mov => {
      const produto = this.data.produtos[mov.produtoId];
      return {
        'Data/Hora': new Date(mov.data).toLocaleString('pt-BR'),
        'Tipo': mov.tipo === 'entrada' ? 'Entrada' : 'Saída',
        'Produto': produto?.nome || 'Produto não encontrado',
        'Código': mov.produtoId,
        'Tamanho': produto?.tamanho || '-',
        'Cor': produto?.cor || '-',
        'Quantidade': mov.tipo === 'entrada' ? `+${mov.quantidade}` : `-${mov.quantidade}`,
        'Observações': mov.observacoes || '-'
      };
    });

    // Criar planilha de movimentações
    const movimentacoesWS = XLSX.utils.json_to_sheet(movimentacoesData);
    XLSX.utils.book_append_sheet(workbook, movimentacoesWS, 'Movimentações');

    // Preparar dados de estatísticas
    const estatisticasData = [
      { 'Métrica': 'Total de Movimentações', 'Valor': this.data.estatisticas.totalMovimentacoes },
      { 'Métrica': 'Total de Entradas', 'Valor': this.data.estatisticas.totalEntradas },
      { 'Métrica': 'Total de Saídas', 'Valor': this.data.estatisticas.totalSaidas },
      { 'Métrica': 'Período Início', 'Valor': this.data.estatisticas.periodoInicio },
      { 'Métrica': 'Período Fim', 'Valor': this.data.estatisticas.periodoFim }
    ];

    // Criar planilha de estatísticas
    const estatisticasWS = XLSX.utils.json_to_sheet(estatisticasData);
    XLSX.utils.book_append_sheet(workbook, estatisticasWS, 'Estatísticas');

    // Preparar dados do estoque atual
    const estoqueData = Object.values(this.data.produtos).map(produto => ({
      'Código': produto.codigo,
      'Nome': produto.nome,
      'Tamanho': produto.tamanho,
      'Cor': produto.cor,
      'Quantidade Atual': produto.quantidade,
      'Estoque Mínimo': produto.estoqueMinimo,
      'Status': produto.quantidade <= produto.estoqueMinimo ? 'ESTOQUE BAIXO' : 'OK',
      'Última Movimentação': new Date(produto.ultimaMovimentacao).toLocaleString('pt-BR')
    }));

    // Criar planilha de estoque
    const estoqueWS = XLSX.utils.json_to_sheet(estoqueData);
    XLSX.utils.book_append_sheet(workbook, estoqueWS, 'Estoque Atual');

    // Converter para buffer
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  }

  generatePDF(): ArrayBuffer {
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Movimentações - Inventário de Uniformes', margin, 30);

    // Informações do relatório
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, 45);
    doc.text(`Período: ${this.data.estatisticas.periodoInicio} até ${this.data.estatisticas.periodoFim}`, margin, 55);
    doc.text(`Filtro: ${this.data.filtros.tipo === 'todos' ? 'Todas as movimentações' : 
      this.data.filtros.tipo === 'entrada' ? 'Apenas entradas' : 'Apenas saídas'}`, margin, 65);

    // Estatísticas
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estatísticas:', margin, 85);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Movimentações: ${this.data.estatisticas.totalMovimentacoes}`, margin, 95);
    doc.text(`Entradas: ${this.data.estatisticas.totalEntradas}`, margin, 105);
    doc.text(`Saídas: ${this.data.estatisticas.totalSaidas}`, margin, 115);

    // Tabela de movimentações
    const tableData = this.data.movimentacoes.map(mov => {
      const produto = this.data.produtos[mov.produtoId];
      return [
        new Date(mov.data).toLocaleDateString('pt-BR'),
        mov.tipo === 'entrada' ? 'Entrada' : 'Saída',
        produto?.nome || 'N/A',
        mov.produtoId,
        mov.tipo === 'entrada' ? `+${mov.quantidade}` : `-${mov.quantidade}`,
        mov.observacoes || '-'
      ];
    });

    autoTable(doc, {
      head: [['Data', 'Tipo', 'Produto', 'Código', 'Qtd', 'Observações']],
      body: tableData,
      startY: 130,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 15 },
        5: { cellWidth: 40 }
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        // Rodapé
        const pageCount = doc.getNumberOfPages();
        const currentPage = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.text(
          `Página ${currentPage} de ${pageCount}`,
          pageWidth - margin - 30,
          doc.internal.pageSize.height - 10
        );
      }
    });

    return doc.output('arraybuffer');
  }

  static getFileName(format: 'excel' | 'pdf', filtros: any): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const tipoSuffix = filtros.tipo === 'todos' ? 'completo' : filtros.tipo;
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    
    return `relatorio-movimentacoes-${tipoSuffix}-${timestamp}.${extension}`;
  }
}

export function downloadFile(buffer: ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
