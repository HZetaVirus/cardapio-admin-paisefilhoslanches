import { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

export const useDeliveryStatus = () => {
  const { atualizarStatusPedido } = useApp();
  const [loading, setLoading] = useState(false);

  const confirmDelivery = useCallback(async (pedidoId: number) => {
    setLoading(true);
    try {
      await atualizarStatusPedido(pedidoId, 'pedidos concluídos');
      toast.success('Pedido marcado como entregue!');
      return true;
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      toast.error('Erro ao confirmar entrega. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [atualizarStatusPedido]);

  return {
    confirmDelivery,
    loading
  };
};