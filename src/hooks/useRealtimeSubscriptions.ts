
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Avaliacao, Pedido } from '@/types';

export const useRealtimeSubscriptions = () => {
  const { clienteAtual, pedidos, avaliacoes, setPedidos, setAvaliacoes } = useApp();
  const channelsRef = useRef<{ pedidos?: any; avaliacoes?: any }>({});
  const isSubscribedRef = useRef(false);

  // Use useCallback to create stable functions that can access current state
  const handlePedidoUpdate = useCallback((payload: any) => {
    console.log('Pedido atualizado:', payload.new);
    
    // Get current pedidos and update the specific one
    const updatedPedidos = pedidos.map((pedido: Pedido) => 
      pedido.id === payload.new.id 
        ? { ...pedido, status: payload.new.status }
        : pedido
    );
    setPedidos(updatedPedidos);
  }, [pedidos, setPedidos]);

  const handleAvaliacaoInsert = useCallback((payload: any) => {
    console.log('Nova avaliação:', payload.new);
    
    const novaAvaliacao: Avaliacao = {
      id: payload.new.id,
      item_id: payload.new.item_id,
      cliente_id: payload.new.cliente_id,
      avaliacao: payload.new.avaliacao,
      comentario: payload.new.comentario || ''
    };
    
    // Get current avaliacoes and add the new one
    const updatedAvaliacoes = [...avaliacoes, novaAvaliacao];
    setAvaliacoes(updatedAvaliacoes);
  }, [avaliacoes, setAvaliacoes]);

  useEffect(() => {
    if (!clienteAtual || isSubscribedRef.current) return;

    console.log('Setting up realtime subscriptions for client:', clienteAtual.id);

    // Canal para atualizações de pedidos do cliente atual
    const pedidosChannelName = `pedidos-status-${clienteAtual.id}`;
    const pedidosChannel = supabase
      .channel(pedidosChannelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `cliente_id=eq.${clienteAtual.id}`
        },
        handlePedidoUpdate
      )
      .subscribe((status) => {
        console.log('Pedidos channel subscription status:', status);
      });

    // Canal para novas avaliações (públicas)
    const avaliacoesChannelName = 'avaliacoes-global';
    const avaliacoesChannel = supabase
      .channel(avaliacoesChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'avaliacao_itens'
        },
        handleAvaliacaoInsert
      )
      .subscribe((status) => {
        console.log('Avaliacoes channel subscription status:', status);
      });

    // Armazenar as referências dos canais
    channelsRef.current = {
      pedidos: pedidosChannel,
      avaliacoes: avaliacoesChannel
    };
    
    isSubscribedRef.current = true;

    // Cleanup das subscrições
    return () => {
      console.log('Cleaning up realtime subscriptions');
      
      if (channelsRef.current.pedidos) {
        supabase.removeChannel(channelsRef.current.pedidos);
        channelsRef.current.pedidos = null;
      }
      
      if (channelsRef.current.avaliacoes) {
        supabase.removeChannel(channelsRef.current.avaliacoes);
        channelsRef.current.avaliacoes = null;
      }
      
      isSubscribedRef.current = false;
    };
  }, [clienteAtual?.id, handlePedidoUpdate, handleAvaliacaoInsert]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (channelsRef.current.pedidos) {
        supabase.removeChannel(channelsRef.current.pedidos);
      }
      if (channelsRef.current.avaliacoes) {
        supabase.removeChannel(channelsRef.current.avaliacoes);
      }
      isSubscribedRef.current = false;
    };
  }, []);
};
