import { useEffect, useRef } from 'react';
import { pwaNotificationService } from '@/services/pwaNotificationService';
import { Pedido } from '@/types';

export const usePWANotifications = (pedidos: Pedido[]) => {
  const previousPedidosRef = useRef<Pedido[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Solicita permissão para notificações na primeira execução
    if (!isInitializedRef.current) {
      pwaNotificationService.requestPermission();
      isInitializedRef.current = true;
    }

    // Se não há pedidos anteriores, apenas atualiza a referência
    if (previousPedidosRef.current.length === 0) {
      previousPedidosRef.current = pedidos;
      return;
    }

    // Verifica novos pedidos
    const newOrders = pedidos.filter(pedido => 
      !previousPedidosRef.current.some(prev => prev.id === pedido.id)
    );

    // Notifica sobre novos pedidos
    newOrders.forEach(pedido => {
      if (pwaNotificationService.isNotificationEnabled()) {
        pwaNotificationService.notifyNewOrder(
          pedido.id.toString(),
          pedido.cliente?.nome || 'Cliente'
        );
      }
    });

    // Verifica mudanças de status
    pedidos.forEach(pedido => {
      const previousPedido = previousPedidosRef.current.find(prev => prev.id === pedido.id);
      if (previousPedido && previousPedido.status !== pedido.status) {
        if (pwaNotificationService.isNotificationEnabled()) {
          pwaNotificationService.notifyStatusChange(
            pedido.id.toString(),
            pedido.status
          );
        }
      }
    });

    // Atualiza a referência
    previousPedidosRef.current = pedidos;
  }, [pedidos]);

  return {
    requestPermission: pwaNotificationService.requestPermission.bind(pwaNotificationService),
    isNotificationEnabled: pwaNotificationService.isNotificationEnabled(),
    isPWAInstalled: pwaNotificationService.isPWAInstalled()
  };
};