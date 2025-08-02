'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Produto } from '@/types';

interface SaidaResult {
  success: boolean;
  message?: string;
  data?: {
    produto: Produto;
    alertaEstoqueBaixo: boolean;
    estoqueAtual: number;
  };
  error?: string;
}

export default function SaidaPage() {
  const [codigo, setCodigo] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SaidaResult | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focar no input quando a página carrega
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Buscar produto quando código é digitado
  useEffect(() => {
    if (codigo.length >= 8) {
      fetchProductInfo(codigo);
    } else {
      setProduto(null);
    }
  }, [codigo]);

  const fetchProductInfo = async (codigoProduto: string) => {
    try {
      const response = await fetch(`/api/saida?codigo=${encodeURIComponent(codigoProduto)}`);
      const data = await response.json();
      
      if (data.success) {
        setProduto(data.data);
      } else {
        setProduto(null);
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      setProduto(null);
    }
  };

  const handleCodigoChange = (value: string) => {
    setCodigo(value);
    setResult(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    // Enter para processar saída
    if (event.key === 'Enter' && codigo && !processing) {
      handleProcessSaida();
    }
  };

  const handleProcessSaida = async () => {
    if (!codigo) {
      setResult({
        success: false,
        error: 'Digite o código de barras do produto'
      });
      return;
    }

    if (quantidade <= 0) {
      setResult({
        success: false,
        error: 'Quantidade deve ser maior que zero'
      });
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/saida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo,
          quantidade
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Limpar formulário após sucesso
        setCodigo('');
        setQuantidade(1);
        setProduto(null);
        
        // Focar novamente no input para próxima leitura
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Erro ao processar saída. Tente novamente.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleScanner = () => {
    setScannerActive(!scannerActive);
    if (!scannerActive && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Saída de Estoque</h1>
        <p className="text-muted-foreground">
          Escaneie ou digite o código de barras para registrar a saída
        </p>
      </div>

      {/* Resultado da operação */}
      {result && (
        <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.success ? '✅' : '❌'} {result.message || result.error}
              </span>
              {result.success && result.data && (
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Estoque: {result.data.estoqueAtual} un
                  </Badge>
                  {result.data.alertaEstoqueBaixo && (
                    <Badge variant="destructive">
                      Estoque Baixo!
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner de Código de Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📱</span>
              Scanner de Código de Barras
            </CardTitle>
            <CardDescription>
              Use um leitor de código de barras ou digite manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="codigo-input">Código de Barras</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="codigo-input"
                  ref={inputRef}
                  value={codigo}
                  onChange={(e) => handleCodigoChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escaneie ou digite o código"
                  className="font-mono"
                  autoComplete="off"
                />
                <Button
                  variant="outline"
                  onClick={toggleScanner}
                  className={scannerActive ? 'bg-green-100 border-green-300' : ''}
                >
                  {scannerActive ? '🟢' : '📱'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {scannerActive ? 'Scanner ativo - aponte para o código de barras' : 'Clique no ícone para ativar o scanner'}
              </p>
            </div>

            <div>
              <Label htmlFor="quantidade-input">Quantidade</Label>
              <Input
                id="quantidade-input"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleProcessSaida}
              disabled={!codigo || processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                'Registrar Saída'
              )}
            </Button>

            {scannerActive && (
              <div className="p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50 text-center">
                <div className="text-green-600 mb-2">
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-sm text-green-700">
                  Scanner ativo - posicione o código de barras na frente do leitor
                </p>
                <p className="text-xs text-green-600 mt-1">
                  O código será inserido automaticamente quando lido
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Produto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📦</span>
              Informações do Produto
            </CardTitle>
            <CardDescription>
              Detalhes do produto selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {produto ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-lg mb-2">{produto.nome}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Código:</span>
                      <p className="font-mono">{produto.codigo}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estoque Atual:</span>
                      <p className="font-semibold">{produto.quantidade} unidades</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tamanho:</span>
                      <p>{produto.tamanho}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cor:</span>
                      <p>{produto.cor}</p>
                    </div>
                  </div>
                </div>

                {produto.quantidade <= produto.estoqueMinimo && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                      ⚠️ Este produto está com estoque baixo (≤ {produto.estoqueMinimo} unidades)
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>Última movimentação: {new Date(produto.ultimaMovimentacao).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ) : codigo.length >= 8 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl mb-4 block">❌</span>
                <p>Produto não encontrado</p>
                <p className="text-sm mt-1">Verifique o código digitado</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl mb-4 block">📱</span>
                <p>Escaneie ou digite o código de barras</p>
                <p className="text-sm mt-1">As informações do produto aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instruções de uso */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">1️⃣</div>
              <h4 className="font-semibold mb-2">Escaneie o Código</h4>
              <p className="text-sm text-muted-foreground">
                Use um leitor de código de barras ou digite manualmente o código do produto
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">2️⃣</div>
              <h4 className="font-semibold mb-2">Confirme a Quantidade</h4>
              <p className="text-sm text-muted-foreground">
                Verifique as informações do produto e ajuste a quantidade se necessário
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">3️⃣</div>
              <h4 className="font-semibold mb-2">Registre a Saída</h4>
              <p className="text-sm text-muted-foreground">
                Clique em "Registrar Saída" ou pressione Enter para confirmar
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Dicas:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Leitores de código de barras funcionam como teclado - apenas escaneie</li>
              <li>• Pressione Enter após digitar o código para processar rapidamente</li>
              <li>• O sistema alerta automaticamente quando o estoque fica baixo</li>
              <li>• Todas as saídas são registradas no histórico</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
