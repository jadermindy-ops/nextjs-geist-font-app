'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Produto } from '@/types';

interface EstoqueData {
  produtos: Produto[];
  alertasEstoqueBaixo: Produto[];
  estatisticas: {
    totalProdutos: number;
    totalEstoque: number;
    produtosComEstoqueBaixo: number;
  };
}

export default function EstoquePage() {
  const [data, setData] = useState<EstoqueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'baixo' | 'normal'>('todos');

  useEffect(() => {
    fetchEstoqueData();
  }, []);

  const fetchEstoqueData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData({
          produtos: result.data.produtos,
          alertasEstoqueBaixo: result.data.alertasEstoqueBaixo,
          estatisticas: result.data.estatisticas
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = data?.produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.tamanho.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.cor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'todos' ||
                         (filterType === 'baixo' && produto.quantidade <= produto.estoqueMinimo) ||
                         (filterType === 'normal' && produto.quantidade > produto.estoqueMinimo);

    return matchesSearch && matchesFilter;
  }) || [];

  const getStatusBadge = (produto: Produto) => {
    if (produto.quantidade === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    } else if (produto.quantidade <= produto.estoqueMinimo) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">Estoque Baixo</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">Normal</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estoque de Uniformes</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie todo o estoque de uniformes
          </p>
        </div>
        <Button onClick={fetchEstoqueData} variant="outline">
          🔄 Atualizar
        </Button>
      </div>

      {/* Alertas de Estoque Baixo */}
      {data?.alertasEstoqueBaixo && data.alertasEstoqueBaixo.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="font-medium text-orange-800">
                ⚠️ {data.alertasEstoqueBaixo.length} produto(s) com estoque baixo precisam de reposição
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-orange-700 border-orange-300"
                onClick={() => setFilterType('baixo')}
              >
                Ver Produtos
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{data?.estatisticas.totalProdutos || 0}</p>
              </div>
              <span className="text-2xl">📦</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total em Estoque</p>
                <p className="text-2xl font-bold">{data?.estatisticas.totalEstoque || 0}</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data?.estatisticas.produtosComEstoqueBaixo || 0}
                </p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos Filtrados</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
              <span className="text-2xl">🔍</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre produtos no estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, código, tamanho ou cor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'todos' ? 'default' : 'outline'}
                onClick={() => setFilterType('todos')}
                size="sm"
              >
                Todos ({data?.produtos.length || 0})
              </Button>
              <Button
                variant={filterType === 'baixo' ? 'default' : 'outline'}
                onClick={() => setFilterType('baixo')}
                size="sm"
                className={filterType === 'baixo' ? '' : 'text-orange-600 border-orange-300'}
              >
                Estoque Baixo ({data?.alertasEstoqueBaixo.length || 0})
              </Button>
              <Button
                variant={filterType === 'normal' ? 'default' : 'outline'}
                onClick={() => setFilterType('normal')}
                size="sm"
                className={filterType === 'normal' ? '' : 'text-green-600 border-green-300'}
              >
                Normal ({(data?.produtos.length || 0) - (data?.alertasEstoqueBaixo.length || 0)})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {filteredProducts.length} produto(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Última Movimentação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">
                        {produto.nome}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {produto.codigo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.tamanho}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.cor}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${
                          produto.quantidade === 0 ? 'text-red-600' :
                          produto.quantidade <= produto.estoqueMinimo ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {produto.quantidade}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(produto)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(produto.ultimaMovimentacao).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📦</span>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'todos' 
                  ? 'Nenhum produto encontrado com os filtros aplicados'
                  : 'Nenhum produto cadastrado no estoque'
                }
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Limpar Busca
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo por Categoria */}
      {data?.produtos && data.produtos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Tamanho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  data.produtos.reduce((acc, produto) => {
                    acc[produto.tamanho] = (acc[produto.tamanho] || 0) + produto.quantidade;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([tamanho, quantidade]) => (
                  <div key={tamanho} className="flex justify-between items-center">
                    <span>{tamanho}</span>
                    <Badge variant="outline">{quantidade} un</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo por Cor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  data.produtos.reduce((acc, produto) => {
                    acc[produto.cor] = (acc[produto.cor] || 0) + produto.quantidade;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([cor, quantidade]) => (
                  <div key={cor} className="flex justify-between items-center">
                    <span>{cor}</span>
                    <Badge variant="outline">{quantidade} un</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
