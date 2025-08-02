module.exports = {

"[project]/.next-internal/server/app/api/reports/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/lib/inventory.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "getInventoryManager": (()=>getInventoryManager)
});
const STORAGE_KEY = 'uniform_inventory';
class InventoryManager {
    data;
    constructor(){
        this.data = this.loadData();
    }
    loadData() {
        if ("TURBOPACK compile-time truthy", 1) {
            return {
                produtos: {},
                movimentacoes: []
            };
        }
        "TURBOPACK unreachable";
    }
    saveData() {
        if ("TURBOPACK compile-time truthy", 1) return;
        "TURBOPACK unreachable";
    }
    addStock(codigo, quantidade, dadosProduto) {
        try {
            const agora = new Date();
            if (this.data.produtos[codigo]) {
                // Produto já existe, apenas adiciona quantidade
                this.data.produtos[codigo].quantidade += quantidade;
                this.data.produtos[codigo].ultimaMovimentacao = agora;
            } else {
                // Novo produto
                const novoProduto = {
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
            const movimentacao = {
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
    removeStock(codigo, quantidade = 1) {
        try {
            const produto = this.data.produtos[codigo];
            if (!produto) {
                return {
                    success: false,
                    message: 'Produto não encontrado no estoque'
                };
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
            const movimentacao = {
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
            return {
                success: false,
                message: 'Erro interno do sistema'
            };
        }
    }
    getStock(codigo) {
        return this.data.produtos[codigo]?.quantidade || 0;
    }
    getProduct(codigo) {
        return this.data.produtos[codigo] || null;
    }
    getAllProducts() {
        return Object.values(this.data.produtos);
    }
    getLowStockAlerts() {
        return Object.values(this.data.produtos).filter((produto)=>produto.quantidade <= produto.estoqueMinimo);
    }
    getRecentMovements(limit = 10) {
        return this.data.movimentacoes.sort((a, b)=>b.data.getTime() - a.data.getTime()).slice(0, limit);
    }
    getMovementsByFilter(filter) {
        let filteredMovements = [
            ...this.data.movimentacoes
        ];
        // Filtrar por data de início
        if (filter.startDate) {
            filteredMovements = filteredMovements.filter((mov)=>mov.data >= filter.startDate);
        }
        // Filtrar por data de fim
        if (filter.endDate) {
            // Adicionar 23:59:59 à data de fim para incluir todo o dia
            const endDate = new Date(filter.endDate);
            endDate.setHours(23, 59, 59, 999);
            filteredMovements = filteredMovements.filter((mov)=>mov.data <= endDate);
        }
        // Filtrar por tipo
        if (filter.tipo) {
            filteredMovements = filteredMovements.filter((mov)=>mov.tipo === filter.tipo);
        }
        // Ordenar por data (mais recente primeiro)
        return filteredMovements.sort((a, b)=>b.data.getTime() - a.data.getTime());
    }
    getAllMovements() {
        return this.data.movimentacoes.sort((a, b)=>b.data.getTime() - a.data.getTime());
    }
    getTotalProducts() {
        return Object.keys(this.data.produtos).length;
    }
    getTotalStock() {
        return Object.values(this.data.produtos).reduce((total, produto)=>total + produto.quantidade, 0);
    }
}
// Singleton instance
let inventoryManager = null;
function getInventoryManager() {
    if (!inventoryManager) {
        inventoryManager = new InventoryManager();
    }
    return inventoryManager;
}
const __TURBOPACK__default__export__ = InventoryManager;
}}),
"[externals]/module [external] (module, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("module", () => require("module"));

module.exports = mod;
}}),
"[project]/src/lib/report-generator.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ReportGenerator": (()=>ReportGenerator),
    "downloadFile": (()=>downloadFile)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-route] (ecmascript)");
;
;
;
class ReportGenerator {
    data;
    constructor(data){
        this.data = data;
    }
    generateExcel() {
        // Criar workbook
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].book_new();
        // Preparar dados das movimentações
        const movimentacoesData = this.data.movimentacoes.map((mov)=>{
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
        const movimentacoesWS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(movimentacoesData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, movimentacoesWS, 'Movimentações');
        // Preparar dados de estatísticas
        const estatisticasData = [
            {
                'Métrica': 'Total de Movimentações',
                'Valor': this.data.estatisticas.totalMovimentacoes
            },
            {
                'Métrica': 'Total de Entradas',
                'Valor': this.data.estatisticas.totalEntradas
            },
            {
                'Métrica': 'Total de Saídas',
                'Valor': this.data.estatisticas.totalSaidas
            },
            {
                'Métrica': 'Período Início',
                'Valor': this.data.estatisticas.periodoInicio
            },
            {
                'Métrica': 'Período Fim',
                'Valor': this.data.estatisticas.periodoFim
            }
        ];
        // Criar planilha de estatísticas
        const estatisticasWS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(estatisticasData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, estatisticasWS, 'Estatísticas');
        // Preparar dados do estoque atual
        const estoqueData = Object.values(this.data.produtos).map((produto)=>({
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
        const estoqueWS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(estoqueData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, estoqueWS, 'Estoque Atual');
        // Converter para buffer
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["write"])(workbook, {
            bookType: 'xlsx',
            type: 'array'
        });
    }
    generatePDF() {
        const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
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
        doc.text(`Filtro: ${this.data.filtros.tipo === 'todos' ? 'Todas as movimentações' : this.data.filtros.tipo === 'entrada' ? 'Apenas entradas' : 'Apenas saídas'}`, margin, 65);
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
        const tableData = this.data.movimentacoes.map((mov)=>{
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(doc, {
            head: [
                [
                    'Data',
                    'Tipo',
                    'Produto',
                    'Código',
                    'Qtd',
                    'Observações'
                ]
            ],
            body: tableData,
            startY: 130,
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [
                    41,
                    128,
                    185
                ],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [
                    245,
                    245,
                    245
                ]
            },
            columnStyles: {
                0: {
                    cellWidth: 25
                },
                1: {
                    cellWidth: 20
                },
                2: {
                    cellWidth: 40
                },
                3: {
                    cellWidth: 30
                },
                4: {
                    cellWidth: 15
                },
                5: {
                    cellWidth: 40
                }
            },
            margin: {
                left: margin,
                right: margin
            },
            didDrawPage: (data)=>{
                // Rodapé
                const pageCount = doc.getNumberOfPages();
                const currentPage = doc.getCurrentPageInfo().pageNumber;
                doc.setFontSize(8);
                doc.text(`Página ${currentPage} de ${pageCount}`, pageWidth - margin - 30, doc.internal.pageSize.height - 10);
            }
        });
        return doc.output('arraybuffer');
    }
    static getFileName(format, filtros) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const tipoSuffix = filtros.tipo === 'todos' ? 'completo' : filtros.tipo;
        const extension = format === 'excel' ? 'xlsx' : 'pdf';
        return `relatorio-movimentacoes-${tipoSuffix}-${timestamp}.${extension}`;
    }
}
function downloadFile(buffer, filename, mimeType) {
    const blob = new Blob([
        buffer
    ], {
        type: mimeType
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
}}),
"[project]/src/app/api/reports/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$inventory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/inventory.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/report-generator.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        // Extrair parâmetros da query
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const tipoParam = searchParams.get('tipo');
        const formatParam = searchParams.get('format');
        // Validar parâmetros obrigatórios
        if (!formatParam || ![
            'excel',
            'pdf'
        ].includes(formatParam)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Formato inválido. Use "excel" ou "pdf"'
            }, {
                status: 400
            });
        }
        // Preparar filtros
        const filtros = {
            startDate: startDateParam || undefined,
            endDate: endDateParam || undefined,
            tipo: tipoParam || 'todos',
            format: formatParam
        };
        // Obter dados do inventário
        const inventoryManager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$inventory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInventoryManager"])();
        // Preparar filtro para o InventoryManager
        const filterForManager = {};
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
        const produtosMap = produtos.reduce((acc, produto)=>{
            acc[produto.id] = produto;
            return acc;
        }, {});
        // Calcular estatísticas
        const totalEntradas = movimentacoes.filter((m)=>m.tipo === 'entrada').length;
        const totalSaidas = movimentacoes.filter((m)=>m.tipo === 'saida').length;
        // Determinar período
        let periodoInicio = 'Início dos registros';
        let periodoFim = 'Fim dos registros';
        if (movimentacoes.length > 0) {
            const datasOrdenadas = movimentacoes.map((m)=>m.data).sort((a, b)=>a.getTime() - b.getTime());
            periodoInicio = filtros.startDate || datasOrdenadas[0].toLocaleDateString('pt-BR');
            periodoFim = filtros.endDate || datasOrdenadas[datasOrdenadas.length - 1].toLocaleDateString('pt-BR');
        }
        // Preparar dados do relatório
        const reportData = {
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
        const reportGenerator = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReportGenerator"](reportData);
        let buffer;
        let mimeType;
        let filename;
        if (formatParam === 'excel') {
            buffer = reportGenerator.generateExcel();
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            filename = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReportGenerator"].getFileName('excel', filtros);
        } else {
            buffer = reportGenerator.generatePDF();
            mimeType = 'application/pdf';
            filename = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReportGenerator"].getFileName('pdf', filtros);
        }
        // Retornar arquivo
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](buffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': buffer.byteLength.toString()
            }
        });
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Erro interno do servidor ao gerar relatório'
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__0b6ec2da._.js.map