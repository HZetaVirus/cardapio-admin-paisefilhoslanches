
import { useState } from 'react';
import { Pedido, Avaliacao, ItemCardapio, ConfiguracaoLoja, StatusPedido } from '@/types';
import * as supabaseService from '@/services/supabaseService';

export const useDataOperations = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);

  const atualizarStatusPedido = async (pedidoId: number, novoStatus: StatusPedido) => {
    const sucesso = await supabaseService.updateStatusPedido(pedidoId, novoStatus);
    
    if (sucesso) {
      setPedidos(pedidos.map(p => 
        p.id === pedidoId ? { ...p, status: novoStatus } : p
      ));
    }
  };

  const avaliarItem = async (itemId: number, avaliacao: number, comentario: string, clienteId: number) => {
    const novaAvaliacao: Omit<Avaliacao, 'id'> = {
      item_id: itemId,
      cliente_id: clienteId,
      avaliacao,
      comentario
    };
    
    const avaliacaoInserida = await supabaseService.insertAvaliacao(novaAvaliacao);
    
    if (avaliacaoInserida) {
      setAvaliacoes([...avaliacoes, avaliacaoInserida]);
    }
  };

  const adicionarItemCardapio = async (item: Omit<ItemCardapio, 'id'>, setCardapio: (fn: (prev: ItemCardapio[]) => ItemCardapio[]) => void) => {
    const novoItem = await supabaseService.insertItemCardapio(item);
    
    if (novoItem) {
      setCardapio(prev => [...prev, novoItem]);
    }
  };

  const atualizarConfiguracaoLoja = async (config: ConfiguracaoLoja, setConfiguracaoLoja: (config: ConfiguracaoLoja) => void) => {
    const sucesso = await supabaseService.updateConfiguracaoLoja(config);
    
    if (sucesso) {
      setConfiguracaoLoja(config);
    }
  };

  return {
    pedidos,
    setPedidos,
    avaliacoes,
    setAvaliacoes,
    atualizarStatusPedido,
    avaliarItem,
    adicionarItemCardapio,
    atualizarConfiguracaoLoja
  };
};
