import { OCRResult } from '@/types';

export async function processInvoiceImage(imageBase64: string): Promise<OCRResult> {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Vision API key não configurada');
    }

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: imageBase64
          },
          features: [
            { type: 'DOCUMENT_TEXT_DETECTION' }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Google Vision: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.responses?.[0]?.error) {
      throw new Error(result.responses[0].error.message);
    }

    const textAnnotations = result.responses?.[0]?.textAnnotations;
    
    if (!textAnnotations || textAnnotations.length === 0) {
      return {
        success: false,
        error: 'Nenhum texto encontrado na imagem'
      };
    }

    // Texto completo extraído
    const fullText = textAnnotations[0].description;
    
    // Processar o texto para extrair informações do uniforme
    const extractedData = extractUniformData(fullText);

    return {
      success: true,
      data: extractedData
    };

  } catch (error) {
    console.error('Erro no processamento OCR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no OCR'
    };
  }
}

function extractUniformData(text: string): {
  codigo?: string;
  nome?: string;
  quantidade?: number;
  tamanho?: string;
  cor?: string;
} {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const result: any = {};

  // Padrões de regex para extrair informações
  const patterns = {
    // Códigos de barras (números longos)
    codigo: /\b\d{8,}\b/,
    
    // Quantidade (números seguidos de palavras como "un", "pç", "peça")
    quantidade: /(\d+)\s*(?:un|pç|peça|unidade|peças)/i,
    
    // Tamanhos comuns
    tamanho: /\b(PP|P|M|G|GG|XG|XXG|XL|XXL|XXXL|\d+)\b/i,
    
    // Cores comuns
    cor: /(azul|branco|preto|cinza|verde|amarelo|vermelho|rosa|marrom|bege)/i,
    
    // Palavras relacionadas a uniformes
    uniforme: /(camisa|calça|bermuda|short|polo|camiseta|blusa|jaqueta|colete|avental|uniforme)/i
  };

  for (const line of lines) {
    // Buscar código de barras
    if (!result.codigo) {
      const codigoMatch = line.match(patterns.codigo);
      if (codigoMatch) {
        result.codigo = codigoMatch[0];
      }
    }

    // Buscar quantidade
    if (!result.quantidade) {
      const quantidadeMatch = line.match(patterns.quantidade);
      if (quantidadeMatch) {
        result.quantidade = parseInt(quantidadeMatch[1]);
      }
    }

    // Buscar tamanho
    if (!result.tamanho) {
      const tamanhoMatch = line.match(patterns.tamanho);
      if (tamanhoMatch) {
        result.tamanho = tamanhoMatch[1].toUpperCase();
      }
    }

    // Buscar cor
    if (!result.cor) {
      const corMatch = line.match(patterns.cor);
      if (corMatch) {
        result.cor = corMatch[1].toLowerCase();
        // Capitalizar primeira letra
        result.cor = result.cor.charAt(0).toUpperCase() + result.cor.slice(1);
      }
    }

    // Buscar nome do produto (linha que contém palavra relacionada a uniforme)
    if (!result.nome) {
      const uniformeMatch = line.match(patterns.uniforme);
      if (uniformeMatch && line.length > 5) {
        result.nome = line;
      }
    }
  }

  // Valores padrão se não encontrados
  if (!result.codigo) {
    result.codigo = `UNI${Date.now().toString().slice(-6)}`;
  }
  
  if (!result.quantidade) {
    result.quantidade = 1;
  }
  
  if (!result.tamanho) {
    result.tamanho = 'M';
  }
  
  if (!result.cor) {
    result.cor = 'Azul';
  }
  
  if (!result.nome) {
    result.nome = `Uniforme ${result.tamanho} ${result.cor}`;
  }

  return result;
}

export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // Remove o prefixo "data:image/...;base64," para obter apenas o base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao converter imagem para base64'));
    };
    
    reader.readAsDataURL(file);
  });
}
