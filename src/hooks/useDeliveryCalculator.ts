import { useState, useEffect } from 'react';
import { calcularTaxaEntrega, type CalculoEntrega } from '@/services/deliveryService';
import { useDebounce } from '@/hooks/useDebounce';

export const useDeliveryCalculator = (endereco: string, valorPedido: number = 0) => {
  const [calculoEntrega, setCalculoEntrega] = useState<CalculoEntrega | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce do endereço para evitar muitas chamadas à API
  const enderecoDebounced = useDebounce(endereco, 1000);

  const calcular = async (enderecoParam?: string, valorParam?: number) => {
    const enderecoFinal = enderecoParam || enderecoDebounced;
    const valorFinal = valorParam !== undefined ? valorParam : valorPedido;

    if (!enderecoFinal || enderecoFinal.length < 10) {
      setCalculoEntrega(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Calculando entrega para:', enderecoFinal, 'Valor:', valorFinal);
      
      const resultado = await calcularTaxaEntrega(enderecoFinal, valorFinal);
      
      console.log('Resultado do cálculo:', resultado);
      
      setCalculoEntrega(resultado);
      
      if (!resultado.entregaDisponivel) {
        setError('Desculpe, não entregamos neste endereço. Área fora da nossa região de entrega.');
      }
      
    } catch (err) {
      console.error('Erro ao calcular entrega:', err);
      setError('Erro ao calcular taxa de entrega. Tente novamente.');
      setCalculoEntrega(null);
    } finally {
      setLoading(false);
    }
  };

  // Recalcular quando endereço ou valor mudar
  useEffect(() => {
    if (enderecoDebounced) {
      calcular();
    }
  }, [enderecoDebounced, valorPedido]);

  // Função para recalcular manualmente
  const recalcular = () => {
    if (endereco) {
      calcular(endereco, valorPedido);
    }
  };

  return {
    calculoEntrega,
    loading,
    error,
    recalcular
  };
};