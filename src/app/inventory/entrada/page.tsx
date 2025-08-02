'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProcessingResult {
  success: boolean;
  message?: string;
  data?: {
    produto: any;
    dadosExtraidos: any;
  };
  error?: string;
}

export default function EntradaPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [manualData, setManualData] = useState({
    codigo: '',
    nome: '',
    quantidade: 1,
    tamanho: 'M',
    cor: 'Azul'
  });
  const [showManualForm, setShowManualForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/entrada', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Limpar formulário após sucesso
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Erro ao processar imagem. Tente novamente.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualData.codigo || !manualData.nome || manualData.quantidade <= 0) {
      setResult({
        success: false,
        error: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      // Simular entrada manual criando um FormData com dados fictícios
      const response = await fetch('/api/entrada', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manual: true,
          ...manualData
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Limpar formulário após sucesso
        setManualData({
          codigo: '',
          nome: '',
          quantidade: 1,
          tamanho: 'M',
          cor: 'Azul'
        });
        setShowManualForm(false);
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Erro ao processar entrada manual. Tente novamente.'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Entrada de Estoque</h1>
        <p className="text-muted-foreground">
          Faça upload da foto da nota fiscal ou registre manualmente
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
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Estoque: {result.data.produto.quantidade} un
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload de Imagem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📸</span>
              Upload da Nota Fiscal
            </CardTitle>
            <CardDescription>
              Faça upload da foto da nota fiscal para processamento automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image-upload">Selecionar Imagem</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Formatos aceitos: JPEG, PNG (máx. 10MB)
              </p>
            </div>

            {previewUrl && (
              <div className="space-y-3">
                <Label>Preview da Imagem</Label>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview da nota fiscal"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/400x300?text=Erro+ao+carregar+imagem";
                    }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleProcessImage}
              disabled={!selectedFile || processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                'Processar Nota Fiscal'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Entrada Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>✏️</span>
              Entrada Manual
            </CardTitle>
            <CardDescription>
              Registre produtos manualmente quando necessário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showManualForm ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Use esta opção quando não for possível processar a nota fiscal automaticamente
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowManualForm(true)}
                  className="w-full"
                >
                  Abrir Formulário Manual
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código de Barras *</Label>
                  <Input
                    id="codigo"
                    value={manualData.codigo}
                    onChange={(e) => setManualData(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Digite o código de barras"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={manualData.nome}
                    onChange={(e) => setManualData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Camisa Polo Azul"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={manualData.quantidade}
                      onChange={(e) => setManualData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tamanho">Tamanho</Label>
                    <select
                      id="tamanho"
                      value={manualData.tamanho}
                      onChange={(e) => setManualData(prev => ({ ...prev, tamanho: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="PP">PP</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                      <option value="XG">XG</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="cor">Cor</Label>
                    <select
                      id="cor"
                      value={manualData.cor}
                      onChange={(e) => setManualData(prev => ({ ...prev, cor: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="Azul">Azul</option>
                      <option value="Branco">Branco</option>
                      <option value="Preto">Preto</option>
                      <option value="Cinza">Cinza</option>
                      <option value="Verde">Verde</option>
                      <option value="Vermelho">Vermelho</option>
                    </select>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button
                    onClick={handleManualEntry}
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      'Registrar Entrada'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowManualForm(false)}
                    disabled={processing}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre o processo */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">📸 Upload Automático</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Faça upload da foto da nota fiscal</li>
                <li>• O sistema extrai automaticamente os dados</li>
                <li>• Código, quantidade e descrição são identificados</li>
                <li>• Produto é adicionado ao estoque</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✏️ Entrada Manual</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use quando a foto não for processada corretamente</li>
                <li>• Preencha os dados manualmente</li>
                <li>• Código de barras é obrigatório</li>
                <li>• Produto é adicionado diretamente ao estoque</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
