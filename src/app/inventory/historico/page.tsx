'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Movimentacao, Produto } from '@/types';
import ReportModal from '@/components/ui/report-modal';

interface HistoricoData {
  produtos: Produto[];
  movimentacoesRecentes: Movimentacao[];
}

export default function HistoricoPage() {
  const [data, setData] = useState<HistoricoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchHistoricoData();
  }, []);

  const fetchHistoricoData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData({
          produtos: result.data.produtos,
          movimentacoesRecentes: result.data.movimentacoesRecentes
        });
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovimentacoes = data?.movimentacoesRecentes.filter(movimentacao => {
    const produto = data.produtos.find(p => p.id === movimentacao.produtoId);
    const produtoNome = produto?.nome || '';
    
    const matchesSearch = produtoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movimentacao.produtoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (movimentacao.observacoes && movimentacao.observacoes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'todos' || movimentacao.tipo === filterType;

    const matchesDate = !dateFilter || 
                       new Date(movimentacao.data).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  }) || [];

  const getMovimentacaoIcon = (tipo: string) => {
    return tipo === 'entrada' ? '📥' : '📤';
  };

  const getMovimentacaoBadge = (tipo: string) => {
    return tipo === 'entrada' 
      ? <Badge className="bg-green-100 text-green-800 border-green-300">Entrada</Badge>
      : <Badge className="bg-red-100 text-red-800 border-red-300">Saída</Badge>;
  };

  const getTotalMovimentacoes = () => {
    return {
      total: data?.movimentacoesRecentes.length || 0,
      entradas: data?.movimentacoesRecentes.filter(m => m.tipo === 'entrada').length || 0,
      saidas: data?.movimentacoesRecentes.filter(m => m.tipo === 'saida').length || 0
    };
  };

  const stats = getTotalMovimentacoes();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Movimentações</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe todas as entradas e saídas de uniformes
          </p>
        </div>
        <div className="flex gap-3">
          <ReportModal />
          <Button onClick={fetchHistoricoData} variant="outline">
            🔄 Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Movimentações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-600">{stats.entradas}</p>
              </div>
              <span className="text-2xl">📥</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saídas</p>
                <p className="text-2xl font-bold text-red-600">{stats.saidas}</p>
              </div>
              <span className="text-2xl">📤</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtradas</p>
                <p className="text-2xl font-bold">{filteredMovimentacoes.length}</p>
              </div>
              <span className="text-2xl">🔍</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre movimentações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar por produto, código ou observação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filtrar por data"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterType === 'todos' ? 'default' : 'outline'}
                onClick={() => setFilterType('todos')}
                size="sm"
                className="flex-1"
              >
                Todos
              </Button>
              <Button
                variant={filterType === 'entrada' ? 'default' : 'outline'}
                onClick={() => setFilterType('entrada')}
                size="sm"
                className="flex-1"
              >
                📥 Entradas
              </Button>
              <Button
                variant={filterType === 'saida' ? 'default' : 'outline'}
                onClick={() => setFilterType('saida')}
                size="sm"
                className="flex-1"
              >
                📤 Saídas
              </Button>
            </div>
          </div>

          {(searchTerm || filterType !== 'todos' || dateFilter) && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('todos');
                  setDateFilter('');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Movimentações</CardTitle>
          <CardDescription>
            {filteredMovimentacoes.length} movimentação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMovimentacoes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovimentacoes.map((movimentacao) => {
                    const produto = data?.produtos.find(p => p.id === movimentacao.produtoId);
                    return (
                      <TableRow key={movimentacao.id}>
                        <TableCell className="text-sm">
                          {new Date(movimentacao.data).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getMovimentacaoIcon(movimentacao.tipo)}</span>
                            {getMovimentacaoBadge(movimentacao.tipo)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {produto?.nome || 'Produto não encontrado'}
                          {produto && (
                            <div className="text-sm text-muted-foreground">
                              {produto.tamanho} • {produto.cor}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {movimentacao.produtoId}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${
                            movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movimentacao.tipo === 'entrada' ? '+' : '-'}{movimentacao.quantidade}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {movimentacao.observacoes || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📋</span>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'todos' || dateFilter
                  ? 'Nenhuma movimentação encontrada com os filtros aplicados'
                  : 'Nenhuma movimentação registrada'
                }
              </p>
              {(searchTerm || filterType !== 'todos' || dateFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('todos');
                    setDateFilter('');
                  }}
                  className="mt-4"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo por Período */}
      {data?.movimentacoesRecentes && data.movimentacoesRecentes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>📥</span>
                    <span>Entradas</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{stats.entradas}</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.entradas / stats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>📤</span>
                    <span>Saídas</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{stats.saidas}</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.saidas / stats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.movimentacoesRecentes.slice(0, 5).map((mov) => {
                  const produto = data.produtos.find(p => p.id === mov.produtoId);
                  return (
                    <div key={mov.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span>{getMovimentacaoIcon(mov.tipo)}</span>
                        <div>
                          <p className="text-sm font-medium">{produto?.nome || 'Produto não encontrado'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(mov.data).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={mov.tipo === 'entrada' ? 'default' : 'secondary'}>
                        {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
