
import type { Pedido, ItemPedido, StatusPedido } from "@/types";
import { withDDoSProtection, supabase } from "./baseService";

export const getPedidos = async (): Promise<Pedido[]> => {
  return await withDDoSProtection(async () => {
    console.log('Buscando pedidos...');
    
    const { data: pedidosData, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes:cliente_id (
          id,
          nome_completo,
          endereco,
          telefone
        )
      `)
      .not('observacao', 'like', 'ARQUIVADO_%') // Filtrar pedidos arquivados
      .order('data_pedido', { ascending: false });
    
    if (pedidosError) {
      console.error('Erro ao buscar pedidos:', pedidosError);
      return [];
    }
    
    console.log('Pedidos encontrados:', pedidosData?.length || 0);
    
    if (!pedidosData || pedidosData.length === 0) {
      return [];
    }
    
    const pedidos = [] as Pedido[];
    
    // Para cada pedido, buscar seus itens com JOIN para pegar o nome do item
    for (const pedido of pedidosData) {
      console.log(`Buscando itens para pedido ${pedido.id}...`);
      
      const { data: itensData, error: itensError } = await supabase
        .from('itens_pedido')
        .select(`
          *,
          cardapio:item_id (
            nome_item
          )
        `)
        .eq('pedido_id', pedido.id);
      
      if (itensError) {
        console.error(`Erro ao buscar itens do pedido ${pedido.id}:`, itensError);
        continue;
      }
      
      console.log(`Itens encontrados para pedido ${pedido.id}:`, itensData?.length || 0);
      
      // Converter os itens para o formato esperado pela aplicação
      const itens: ItemPedido[] = (itensData || []).map(item => {
        const nomeItem = item.cardapio?.nome_item || `Item ${item.item_id}`;
        console.log(`Item ${item.item_id}: ${nomeItem}`);
        
        return {
          item_id: item.item_id,
          quantidade: item.quantidade,
          observacao: item.observacao || '',
          nome_item: nomeItem,
          preco: Number(item.preco_unitario)
        };
      });
      
      // Limpar observação se contém dados de arquivamento
      let observacaoLimpa = pedido.observacao || '';
      if (observacaoLimpa.startsWith('ARQUIVADO_')) {
        const match = observacaoLimpa.match(/^ARQUIVADO_.+?_(.*)$/);
        observacaoLimpa = match ? match[1] : '';
      }
      
      pedidos.push({
        id: pedido.id,
        cliente_id: pedido.cliente_id,
        itens,
        status: pedido.status as StatusPedido,
        forma_pagamento: pedido.forma_pagamento as any,
        observacao: observacaoLimpa,
        data_pedido: pedido.data_pedido,
        valor_total: Number(pedido.valor_total),
        troco_para: pedido.troco_para ? Number(pedido.troco_para) : undefined,
        cliente: pedido.clientes ? {
          id: pedido.clientes.id,
          nome_completo: pedido.clientes.nome_completo,
          endereco: pedido.clientes.endereco,
          telefone: pedido.clientes.telefone,
          data_ultimo_pedido: null
        } : undefined
      });
    }
    
    console.log('Total de pedidos processados:', pedidos.length);
    return pedidos;
  });
};

export const insertPedido = async (pedido: Omit<Pedido, 'id'>): Promise<Pedido | null> => {
  return await withDDoSProtection(async () => {
    console.log('Inserindo pedido:', pedido);
    
    // Primeiro, inserir o pedido
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        cliente_id: pedido.cliente_id,
        status: pedido.status,
        forma_pagamento: pedido.forma_pagamento,
        observacao: pedido.observacao,
        valor_total: pedido.valor_total,
        troco_para: pedido.troco_para
      })
      .select()
      .single();
    
    if (pedidoError || !pedidoData) {
      console.error('Erro ao inserir pedido:', pedidoError);
      return null;
    }
    
    console.log('Pedido inserido com sucesso:', pedidoData);
    
    // Em seguida, inserir os itens do pedido um por um para melhor controle de erro
    const itensInseridos: ItemPedido[] = [];
    
    for (const item of pedido.itens) {
      console.log('Inserindo item:', item);
      
      const { data: itemData, error: itemError } = await supabase
        .from('itens_pedido')
        .insert({
          pedido_id: pedidoData.id,
          item_id: item.item_id,
          quantidade: item.quantidade,
          observacao: item.observacao || '',
          preco_unitario: item.preco
        })
        .select()
        .single();
      
      if (itemError) {
        console.error('Erro ao inserir item do pedido:', itemError);
        // Continue tentando inserir os outros itens mesmo se um falhar
        continue;
      }
      
      console.log('Item inserido com sucesso:', itemData);
      itensInseridos.push(item);
    }
    
    console.log(`Itens inseridos: ${itensInseridos.length} de ${pedido.itens.length}`);
    
    return {
      ...pedidoData,
      itens: itensInseridos,
      observacao: pedidoData.observacao || '',
      valor_total: Number(pedidoData.valor_total),
      troco_para: pedidoData.troco_para ? Number(pedidoData.troco_para) : undefined
    } as Pedido;
  });
};

export const updateStatusPedido = async (pedidoId: number, novoStatus: StatusPedido): Promise<boolean> => {
  return await withDDoSProtection(async () => {
    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', pedidoId);
    
    if (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return false;
    }
    
    return true;
  });
};

// Função para buscar pedidos arquivados (para relatórios)
export const getPedidosArquivadosRelatorio = async (dataInicio?: string, dataFim?: string): Promise<any[]> => {
  return await withDDoSProtection(async () => {
    let query = supabase
      .from('pedidos')
      .select('*')
      .like('observacao', 'ARQUIVADO_%')
      .order('data_pedido', { ascending: false });
    
    if (dataInicio) {
      query = query.gte('data_pedido', dataInicio);
    }
    
    if (dataFim) {
      query = query.lte('data_pedido', dataFim);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar pedidos arquivados:', error);
      return [];
    }
    
    // Converter observações com dados de arquivamento
    return (data || []).map(pedido => {
      const observacao = pedido.observacao || '';
      const arquivadoMatch = observacao.match(/^ARQUIVADO_(.+?)_(.*)$/);
      const dataArquivamento = arquivadoMatch ? arquivadoMatch[1] : new Date().toISOString();
      const observacaoOriginal = arquivadoMatch ? arquivadoMatch[2] : pedido.observacao;
      
      return {
        ...pedido,
        observacao: observacaoOriginal || '',
        data_arquivamento: dataArquivamento
      };
    });
  });
};
