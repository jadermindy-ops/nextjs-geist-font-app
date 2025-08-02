'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { downloadFile } from '@/lib/report-generator';

interface ReportModalProps {
  trigger?: React.ReactNode;
}

export default function ReportModal({ trigger }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    tipo: 'todos',
    format: 'excel'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): string | null => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate > endDate) {
        return 'A data de início deve ser anterior à data de fim';
      }
    }
    
    return null;
  };

  const handleGenerateReport = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Construir URL da API
      const params = new URLSearchParams();
      
      if (formData.startDate) params.append('startDate', formData.startDate);
      if (formData.endDate) params.append('endDate', formData.endDate);
      if (formData.tipo) params.append('tipo', formData.tipo);
      params.append('format', formData.format);

      const response = await fetch(`/api/reports?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar relatório');
      }

      // Obter o buffer do arquivo
      const buffer = await response.arrayBuffer();
      
      // Determinar tipo MIME e nome do arquivo
      const mimeType = formData.format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const tipoSuffix = formData.tipo === 'todos' ? 'completo' : formData.tipo;
      const extension = formData.format === 'excel' ? 'xlsx' : 'pdf';
      const filename = `relatorio-movimentacoes-${tipoSuffix}-${timestamp}.${extension}`;

      // Fazer download do arquivo
      downloadFile(buffer, filename, mimeType);
      
      setSuccess(`Relatório ${formData.format.toUpperCase()} gerado com sucesso!`);
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <span>📊</span>
      Gerar Relatório
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>📊</span>
            Gerar Relatório
          </DialogTitle>
          <DialogDescription>
            Configure os filtros e escolha o formato do relatório
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alertas */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                ❌ {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✅ {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Formulário */}
          <div className="space-y-4">
            {/* Período */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Período (opcional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                    Data Início
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                    Data Fim
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Movimentação */}
            <div>
              <Label htmlFor="tipo" className="text-sm font-medium">
                Tipo de Movimentação
              </Label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="todos">📋 Todas as movimentações</option>
                <option value="entrada">📥 Apenas entradas</option>
                <option value="saida">📤 Apenas saídas</option>
              </select>
            </div>

            {/* Formato */}
            <div>
              <Label htmlFor="format" className="text-sm font-medium">
                Formato do Relatório
              </Label>
              <select
                id="format"
                value={formData.format}
                onChange={(e) => handleInputChange('format', e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="excel">📊 Excel (.xlsx)</option>
                <option value="pdf">📄 PDF (.pdf)</option>
              </select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <span className="mr-2">
                    {formData.format === 'excel' ? '📊' : '📄'}
                  </span>
                  Gerar Relatório
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>

          {/* Informações */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>• Se não especificar período, incluirá todas as movimentações</p>
            <p>• Excel: Planilhas separadas para movimentações, estatísticas e estoque</p>
            <p>• PDF: Relatório formatado com tabelas e estatísticas</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
