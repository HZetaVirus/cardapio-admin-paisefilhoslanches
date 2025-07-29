import { supabase } from '@/integrations/supabase/client';

export interface DeliveryCalculationResult {
  success: boolean;
  taxa: number;
  distancia?: number;
  metodo: 'bairro' | 'quilometragem';
  erro?: string;
}

export interface ConfiguracaoEntrega {
  taxaPorKm: number;
  taxaMinima: number;
  taxaMaxima: number;
  raioMaximo: number;
  enderecoRestaurante: string;
  coordenadasRestaurante: [number, number] | null;
}

export class DeliveryCalculationService {
  private static instance: DeliveryCalculationService;
  private configuracao: ConfiguracaoEntrega | null = null;

  static getInstance(): DeliveryCalculationService {
    if (!DeliveryCalculationService.instance) {
      DeliveryCalculationService.instance = new DeliveryCalculationService();
    }
    return DeliveryCalculationService.instance;
  }

  async carregarConfiguracao(): Promise<ConfiguracaoEntrega> {
    if (!this.configuracao) {
      const configSalva = localStorage.getItem('configuracao_entrega');
      if (configSalva) {
        this.configuracao = JSON.parse(configSalva);
      } else {
        // Configuração padrão
        this.configuracao = {
          taxaPorKm: 2.50,
          taxaMinima: 3.00,
          taxaMaxima: 15.00,
          raioMaximo: 10,
          enderecoRestaurante: '',
          coordenadasRestaurante: null
        };
      }
    }
    return this.configuracao;
  }

  async calcularTaxaEntrega(enderecoCliente: string, bairroCliente?: string): Promise<DeliveryCalculationResult> {
    try {
      // Primeiro, tentar buscar por bairro
      if (bairroCliente) {
        const resultadoBairro = await this.calcularPorBairro(bairroCliente);
        if (resultadoBairro.success) {
          return resultadoBairro;
        }
      }

      // Se não encontrou por bairro, calcular por quilometragem
      return await this.calcularPorQuilometragem(enderecoCliente);
    } catch (error) {
      console.error('Erro ao calcular taxa de entrega:', error);
      return {
        success: false,
        taxa: 0,
        metodo: 'quilometragem',
        erro: 'Erro interno no cálculo de entrega'
      };
    }
  }

  private async calcularPorBairro(bairro: string): Promise<DeliveryCalculationResult> {
    try {
      const { data, error } = await supabase
        .from('taxas_entrega')
        .select('taxa')
        .eq('bairro', bairro.trim())
        .eq('ativo', true)
        .single();

      if (error || !data) {
        return {
          success: false,
          taxa: 0,
          metodo: 'bairro',
          erro: 'Bairro não encontrado ou inativo'
        };
      }

      return {
        success: true,
        taxa: data.taxa,
        metodo: 'bairro'
      };
    } catch (error) {
      return {
        success: false,
        taxa: 0,
        metodo: 'bairro',
        erro: 'Erro ao consultar taxa por bairro'
      };
    }
  }

  private async calcularPorQuilometragem(enderecoCliente: string): Promise<DeliveryCalculationResult> {
    try {
      const configuracao = await this.carregarConfiguracao();

      if (!configuracao.coordenadasRestaurante) {
        return {
          success: false,
          taxa: 0,
          metodo: 'quilometragem',
          erro: 'Coordenadas do restaurante não configuradas'
        };
      }

      // Buscar coordenadas do cliente
      const coordenadasCliente = await this.buscarCoordenadas(enderecoCliente);
      if (!coordenadasCliente) {
        return {
          success: false,
          taxa: 0,
          metodo: 'quilometragem',
          erro: 'Endereço do cliente não encontrado'
        };
      }

      // Calcular distância
      const distancia = await this.calcularDistancia(
        configuracao.coordenadasRestaurante,
        coordenadasCliente
      );

      if (distancia === null) {
        return {
          success: false,
          taxa: 0,
          metodo: 'quilometragem',
          erro: 'Erro ao calcular distância'
        };
      }

      // Verificar se está dentro do raio máximo
      if (distancia > configuracao.raioMaximo) {
        return {
          success: false,
          taxa: 0,
          distancia,
          metodo: 'quilometragem',
          erro: `Endereço fora da área de entrega (máximo ${configuracao.raioMaximo}km)`
        };
      }

      // Calcular taxa
      let taxa = distancia * configuracao.taxaPorKm;
      
      // Aplicar limites mínimo e máximo
      taxa = Math.max(configuracao.taxaMinima, Math.min(configuracao.taxaMaxima, taxa));

      return {
        success: true,
        taxa: Math.round(taxa * 100) / 100, // Arredondar para 2 casas decimais
        distancia,
        metodo: 'quilometragem'
      };
    } catch (error) {
      return {
        success: false,
        taxa: 0,
        metodo: 'quilometragem',
        erro: 'Erro no cálculo por quilometragem'
      };
    }
  }

  private async buscarCoordenadas(endereco: string): Promise<[number, number] | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`,
        {
          headers: {
            'User-Agent': 'CardapioDigital/1.0'
          }
        }
      );

      const data = await response.json();
      
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      return null;
    }
  }

  private async calcularDistancia(
    coordenadas1: [number, number],
    coordenadas2: [number, number]
  ): Promise<number | null> {
    try {
      // Usar a API OSRM para calcular a distância real por estrada
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordenadas1[1]},${coordenadas1[0]};${coordenadas2[1]},${coordenadas2[0]}?overview=false&alternatives=false&steps=false`,
        {
          headers: {
            'User-Agent': 'CardapioDigital/1.0'
          }
        }
      );

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // Distância em metros, converter para quilômetros
        const distanciaKm = data.routes[0].distance / 1000;
        return Math.round(distanciaKm * 100) / 100; // Arredondar para 2 casas decimais
      }

      // Fallback: calcular distância em linha reta (Haversine)
      return this.calcularDistanciaHaversine(coordenadas1, coordenadas2);
    } catch (error) {
      console.error('Erro ao calcular distância via OSRM, usando Haversine:', error);
      // Fallback: calcular distância em linha reta
      return this.calcularDistanciaHaversine(coordenadas1, coordenadas2);
    }
  }

  private calcularDistanciaHaversine(
    coordenadas1: [number, number],
    coordenadas2: [number, number]
  ): number {
    const R = 6371; // Raio da Terra em quilômetros
    const dLat = this.toRadians(coordenadas2[0] - coordenadas1[0]);
    const dLon = this.toRadians(coordenadas2[1] - coordenadas1[1]);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coordenadas1[0])) * Math.cos(this.toRadians(coordenadas2[0])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    
    return Math.round(distancia * 100) / 100;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Método para testar o cálculo
  async testarCalculo(enderecoTeste: string, bairroTeste?: string): Promise<DeliveryCalculationResult> {
    console.log('Testando cálculo de entrega para:', enderecoTeste, bairroTeste);
    const resultado = await this.calcularTaxaEntrega(enderecoTeste, bairroTeste);
    console.log('Resultado do teste:', resultado);
    return resultado;
  }
}