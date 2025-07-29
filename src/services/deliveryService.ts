import { supabase } from '@/integrations/supabase/client';

export interface EnderecoCompleto {
  rua: string;
  numero?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  complemento?: string;
  latitude?: number;
  longitude?: number;
}

export interface TaxaEntrega {
  id: number;
  bairro: string;
  taxa: number;
  ativo: boolean;
  created_at: string;
}

export interface CalculoEntrega {
  taxa: number;
  distancia: number;
  bairro: string;
  metodo: 'bairro' | 'distancia' | 'padrao';
  entregaDisponivel: boolean;
}

// Coordenadas da loja em Belford Roxo (exemplo - você deve ajustar)
const COORDENADAS_LOJA = {
  latitude: -22.7641,
  longitude: -43.3956
};

// Configurações de entrega
const CONFIG_ENTREGA = {
  raioMaximo: 15, // km
  taxaPorKm: 2.50, // R$ por km excedente
  taxaPadrao: 5.00, // R$ taxa padrão
  distanciaGratis: 3, // km grátis
  valorMinimoFreteGratis: 50.00 // R$ para frete grátis
};

// Geocodificação usando OpenStreetMap Nominatim
export const geocodificarEndereco = async (endereco: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    // Adicionar Belford Roxo, RJ ao endereço para melhor precisão
    const enderecoCompleto = `${endereco}, Belford Roxo, Rio de Janeiro, Brasil`;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1&countrycodes=br`
    );
    
    if (!response.ok) {
      throw new Error('Erro na geocodificação');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
};

// Calcular distância entre dois pontos (fórmula de Haversine)
export const calcularDistancia = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  
  return Math.round(distancia * 100) / 100; // Arredondar para 2 casas decimais
};

// Buscar taxa por bairro
export const buscarTaxaPorBairro = async (bairro: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('taxas_entrega')
      .select('taxa')
      .eq('bairro', bairro.toLowerCase().trim())
      .eq('ativo', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data.taxa;
  } catch (error) {
    console.error('Erro ao buscar taxa por bairro:', error);
    return null;
  }
};

// Extrair bairro do endereço usando OpenStreetMap
export const extrairBairroDoEndereco = async (endereco: string): Promise<string | null> => {
  try {
    const enderecoCompleto = `${endereco}, Belford Roxo, Rio de Janeiro, Brasil`;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1&addressdetails=1&countrycodes=br`
    );
    
    if (!response.ok) {
      throw new Error('Erro na busca de bairro');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0 && data[0].address) {
      const address = data[0].address;
      // Tentar diferentes campos que podem conter o bairro
      return address.suburb || address.neighbourhood || address.quarter || address.district || null;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair bairro:', error);
    return null;
  }
};

// Calcular taxa de entrega principal
export const calcularTaxaEntrega = async (
  endereco: string, 
  valorPedido: number = 0
): Promise<CalculoEntrega> => {
  try {
    console.log('Calculando taxa de entrega para:', endereco);

    // 1. Verificar se tem frete grátis por valor mínimo
    if (valorPedido >= CONFIG_ENTREGA.valorMinimoFreteGratis) {
      return {
        taxa: 0,
        distancia: 0,
        bairro: '',
        metodo: 'padrao',
        entregaDisponivel: true
      };
    }

    // 2. Tentar buscar por bairro primeiro
    const bairro = await extrairBairroDoEndereco(endereco);
    if (bairro) {
      const taxaBairro = await buscarTaxaPorBairro(bairro);
      if (taxaBairro !== null) {
        return {
          taxa: taxaBairro,
          distancia: 0,
          bairro: bairro,
          metodo: 'bairro',
          entregaDisponivel: true
        };
      }
    }

    // 3. Calcular por distância
    const coordenadas = await geocodificarEndereco(endereco);
    if (coordenadas) {
      const distancia = calcularDistancia(
        COORDENADAS_LOJA.latitude,
        COORDENADAS_LOJA.longitude,
        coordenadas.lat,
        coordenadas.lon
      );

      // Verificar se está dentro do raio de entrega
      if (distancia > CONFIG_ENTREGA.raioMaximo) {
        return {
          taxa: 0,
          distancia: distancia,
          bairro: bairro || '',
          metodo: 'distancia',
          entregaDisponivel: false
        };
      }

      // Calcular taxa por distância
      let taxa = CONFIG_ENTREGA.taxaPadrao;
      if (distancia > CONFIG_ENTREGA.distanciaGratis) {
        const kmExcedente = distancia - CONFIG_ENTREGA.distanciaGratis;
        taxa += kmExcedente * CONFIG_ENTREGA.taxaPorKm;
      }

      return {
        taxa: Math.round(taxa * 100) / 100,
        distancia: distancia,
        bairro: bairro || '',
        metodo: 'distancia',
        entregaDisponivel: true
      };
    }

    // 4. Fallback - taxa padrão
    return {
      taxa: CONFIG_ENTREGA.taxaPadrao,
      distancia: 0,
      bairro: bairro || '',
      metodo: 'padrao',
      entregaDisponivel: true
    };

  } catch (error) {
    console.error('Erro ao calcular taxa de entrega:', error);
    return {
      taxa: CONFIG_ENTREGA.taxaPadrao,
      distancia: 0,
      bairro: '',
      metodo: 'padrao',
      entregaDisponivel: true
    };
  }
};

// Buscar todas as taxas por bairro (para admin)
export const buscarTaxasBairros = async (): Promise<TaxaEntrega[]> => {
  try {
    const { data, error } = await supabase
      .from('taxas_entrega')
      .select('*')
      .order('bairro');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar taxas de bairros:', error);
    return [];
  }
};

// Criar/atualizar taxa por bairro (para admin)
export const salvarTaxaBairro = async (bairro: string, taxa: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('taxas_entrega')
      .upsert({
        bairro: bairro.toLowerCase().trim(),
        taxa: taxa,
        ativo: true
      }, {
        onConflict: 'bairro'
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Erro ao salvar taxa de bairro:', error);
    return false;
  }
};