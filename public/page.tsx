
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InstallPWA from '@/components/ui/install-pwa';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Produto, Movimentacao } from '@/types';

interface DashboardData {
  produtos: Produto[];
  alertasEstoqueBaixo: Produto[];
  movimentacoesRecentes: Movimentacao[];
  estatisticas: {
    totalProdutos: number;
    totalEstoque: number;
    produtosComEstoqueBaixo: number;
    ultimasMovimentacoes: number;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c288a] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Controle de Estoque</h1>
                <p className="text-gray-600 mt-1">Sistema de gerenciamento de uniformes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/inventory/entrada">
                <Button size="lg" className="bg-[#8c288a] hover:bg-[#7a2478] text-white">
                  Entrada de Estoque
                </Button>
              </Link>
              <Link href="/inventory/saida">
                <Button size="lg" variant="outline" className="border-[#8c288a] text-[#8c288a] hover:bg-[#8c288a] hover:text-white">
                  Saída de Estoque
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Install PWA Prompt */}
        <InstallPWA />
        
        {/* Alertas de Estoque Baixo */}
        {data?.alertasEstoqueBaixo && data.alertasEstoqueBaixo.length > 0 && (
          <Alert className="mb-8 border-[#8c288a]/30 bg-[#8c288a]/5">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#8c288a]">
                  ⚠️ {data.alertasEstoqueBaixo.length} produto(s) com estoque baixo (≤ 10 unidades)
                </span>
                <Link href="/inventory/estoque">
                  <Button variant="outline" size="sm" className="text-[#8c288a] border-[#8c288a] hover:bg-[#8c288a] hover:text-white">
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{data?.estatisticas.totalProdutos || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{data?.estatisticas.totalEstoque || 0}</div>
              <p className="text-xs text-gray-500 mt-1">unidades</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8c288a]">
                {data?.estatisticas.produtosComEstoqueBaixo || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">produtos</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Movimentações Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{data?.estatisticas.ultimasMovimentacoes || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produtos com Estoque Baixo */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-800">Alertas de Estoque</CardTitle>
              <CardDescription className="text-gray-600">Produtos que precisam de reposição</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.alertasEstoqueBaixo && data.alertasEstoqueBaixo.length > 0 ? (
                <div className="space-y-3">
                  {data.alertasEstoqueBaixo.slice(0, 5).map((produto) => (
                    <div key={produto.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{produto.nome}</p>
                        <p className="text-sm text-gray-600">
                          Código: {produto.codigo} • {produto.tamanho} • {produto.cor}
                        </p>
                      </div>
                      <Badge className="bg-[#8c288a] text-white">
                        {produto.quantidade} un
                      </Badge>
                    </div>
                  ))}
                  {data.alertasEstoqueBaixo.length > 5 && (
                    <Link href="/inventory/estoque">
                      <Button variant="outline" className="w-full mt-3 border-[#8c288a] text-[#8c288a] hover:bg-[#8c288a] hover:text-white">
                        Ver todos ({data.alertasEstoqueBaixo.length})
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>✅ Todos os produtos estão com estoque adequado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Movimentações Recentes */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-800">Movimentações Recentes</CardTitle>
              <CardDescription className="text-gray-600">Últimas entradas e saídas</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.movimentacoesRecentes && data.movimentacoesRecentes.length > 0 ? (
                <div className="space-y-3">
                  {data.movimentacoesRecentes.slice(0, 5).map((mov) => {
                    const produto = data.produtos.find(p => p.id === mov.produtoId);
                    return (
                      <div key={mov.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{produto?.nome || 'Produto não encontrado'}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(mov.data).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={mov.tipo === 'entrada' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                            {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {data.movimentacoesRecentes.length > 5 && (
                    <Link href="/inventory/historico">
                      <Button variant="outline" className="w-full mt-3 border-[#8c288a] text-[#8c288a] hover:bg-[#8c288a] hover:text-white">
                        Ver histórico completo
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>Nenhuma movimentação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="mt-8 bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Ações Rápidas</CardTitle>
            <CardDescription className="text-gray-600">Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/inventory/entrada">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-[#8c288a] text-[#8c288a] hover:bg-[#8c288a] hover:text-white">
                  <span className="text-2xl">📸</span>
                  <span>Registrar Entrada</span>
                </Button>
              </Link>
              
              <Link href="/inventory/saida">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-[#8c288a] text-[#8c288a] hover:bg-[#8c288a] hover:text-white">
                  <span className="text-2xl">📱</span>
                  <span>Registrar Saída</span>
                </Button>
              </Link>
              
              <Link href="/inventory/estoque">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-[#8c288a] text-[#8c288a] hover:bg-[#8c288a] hover:text-white">
                  <span className="text-2xl">📊</span>
                  <span>Ver Estoque</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
