import { NextRequest, NextResponse } from 'next/server';
import { processInvoiceImage, convertImageToBase64 } from '@/lib/ocr-service';
import { getInventoryManager } from '@/lib/inventory';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type');
    
    // Verificar se é entrada manual (JSON) ou upload de imagem (FormData)
    if (contentType?.includes('application/json')) {
      // Entrada manual
      const body = await request.json();
      const { manual, codigo, nome, quantidade, tamanho, cor } = body;

      if (!manual) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Requisição inválida'
        }, { status: 400 });
      }

      if (!codigo || !nome || !quantidade || quantidade <= 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Todos os campos são obrigatórios'
        }, { status: 400 });
      }

      const inventoryManager = getInventoryManager();
      
      const success = inventoryManager.addStock(codigo, quantidade, {
        nome,
        tamanho: tamanho || 'M',
        cor: cor || 'Azul'
      });

      if (!success) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Erro ao adicionar produto ao estoque'
        }, { status: 500 });
      }

      const produto = inventoryManager.getProduct(codigo);

      return NextResponse.json<ApiResponse>({
        success: true,
        message: `Produto adicionado manualmente! Estoque atual: ${produto?.quantidade} unidades`,
        data: {
          produto,
          dadosExtraidos: { codigo, nome, quantidade, tamanho, cor }
        }
      });
    } else {
      // Upload de imagem
      const formData = await request.formData();
      const file = formData.get('image') as File;

      if (!file) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Nenhuma imagem foi enviada'
        }, { status: 400 });
      }

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Tipo de arquivo não suportado. Use JPEG ou PNG.'
        }, { status: 400 });
      }

      // Validar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Arquivo muito grande. Máximo 10MB.'
        }, { status: 400 });
      }

      // Converter para base64
      const base64Image = await convertImageToBase64(file);

      // Processar com OCR
      const ocrResult = await processInvoiceImage(base64Image);

      if (!ocrResult.success) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: ocrResult.error || 'Erro no processamento da imagem'
        }, { status: 400 });
      }

      // Adicionar ao estoque
      const inventoryManager = getInventoryManager();
      const { codigo, quantidade, nome, tamanho, cor } = ocrResult.data!;

      if (!codigo || !quantidade) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Não foi possível extrair código ou quantidade da nota fiscal'
        }, { status: 400 });
      }

      const success = inventoryManager.addStock(codigo, quantidade, {
        nome,
        tamanho,
        cor
      });

      if (!success) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Erro ao adicionar produto ao estoque'
        }, { status: 500 });
      }

      const produto = inventoryManager.getProduct(codigo);

      return NextResponse.json<ApiResponse>({
        success: true,
        message: `Produto adicionado com sucesso! Estoque atual: ${produto?.quantidade} unidades`,
        data: {
          produto,
          dadosExtraidos: ocrResult.data
        }
      });
    }

  } catch (error) {
    console.error('Erro no endpoint de entrada:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
