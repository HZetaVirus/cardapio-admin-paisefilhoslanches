import { supabase } from "@/integrations/supabase/client";
import type { Pedido } from "@/types";

export interface PedidoArquivado {
  id: number;
  cliente_id: number;
  status: string;
  forma_pagamento: string;
  observacao: string;
  data_pedido: string;
  data_arquivamento: string;
  valor_total: number;
  troco_para?: number;
  itens: any; // JSON com os itens do pedido
}

// Arquivar pedidos concluídos e cancelados (marcar como arquivados)
export const arquivarPedidosFinalizados = async (): Promise<boolean> => {
  try {
    console.log('Iniciando arquivamento de pedidos...');
    
    // Buscar pedidos concluídos e cancelados que ainda não foram arquivados
    const { data: pedidosParaArquivar, error: fetchError } = await supabase
      .from('pedidos')
      .select('*')
      .in('status', ['pedidos concluídos', 'pedidos cancelados'])
      .is('observacao', null); // Usaremos observacao como flag de arquivamento temporariamente
    
    if (fetchError) {
      console.error('Erro ao buscar pedidos para arquivar:', fetchError);
      return false;
    }
    
    if (!pedidosParaArquivar || pedidosParaArquivar.length === 0) {
      console.log('Nenhum pedido para arquivar hoje');
      return true;
    }
    
    console.log(`Marcando ${pedidosParaArquivar.length} pedidos como arquivados...`);
    
    // Marcar pedidos como arquivados adicionando data de arquivamento na observação
    for (const pedido of pedidosParaArquivar) {
      const dataArquivamento = new Date().toISOString();
      const observacaoArquivada = `ARQUIVADO_${dataArquivamento}_${pedido.observacao || ''}`;
      
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ 
          observacao: observacaoArquivada
        })
        .eq('id', pedido.id);
      
      if (updateError) {
        console.error(`Erro ao arquivar pedido ${pedido.id}:`, updateError);
        continue;
      }
    }
    
    console.log('Arquivamento concluído com sucesso');
    return true;
    
  } catch (error) {
    console.error('Erro no processo de arquivamento:', error);
    return false;
  }
};

// Buscar pedidos arquivados por período (para relatórios)
export const getPedidosArquivados = async (dataInicio: string, dataFim: string): Promise<PedidoArquivado[]> => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .like('observacao', 'ARQUIVADO_%')
    .gte('data_pedido', dataInicio)
    .lte('data_pedido', dataFim)
    .order('data_pedido', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar pedidos arquivados:', error);
    return [];
  }
  
  // Converter para o formato esperado
  return (data || []).map(pedido => {
    const observacao = pedido.observacao || '';
    const arquivadoMatch = observacao.match(/^ARQUIVADO_(.+?)_(.*)$/);
    const dataArquivamento = arquivadoMatch ? arquivadoMatch[1] : new Date().toISOString();
    const observacaoOriginal = arquivadoMatch ? arquivadoMatch[2] : pedido.observacao;
    
    return {
      id: pedido.id,
      cliente_id: pedido.cliente_id,
      status: pedido.status,
      forma_pagamento: pedido.forma_pagamento,
      observacao: observacaoOriginal || '',
      data_pedido: pedido.data_pedido,
      data_arquivamento: dataArquivamento,
      valor_total: Number(pedido.valor_total),
      troco_para: pedido.troco_para ? Number(pedido.troco_para) : undefined,
      itens: [] // Será preenchido se necessário
    } as PedidoArquivado;
  });
};

// Buscar pedidos arquivados do mês atual
export const getPedidosArquivadosDoMes = async (): Promise<PedidoArquivado[]> => {
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
  
  return getPedidosArquivados(
    inicioMes.toISOString(),
    fimMes.toISOString()
  );
};
