
import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { rawbtService } from '@/services/rawbtService';
import { toast } from 'sonner';

export const useRawbtIntegration = () => {
  const { pedidos, clientes } = useApp();
  
  useEffect(() => {
    // Verificar se há novos pedidos pendentes para impressão automática
    const pedidosPendentes = pedidos.filter(p => p.status === 'pendente');
    
    if (pedidosPendentes.length > 0) {
      // Pegar o pedido mais recente
      const ultimoPedido = pedidosPendentes
        .sort((a, b) => new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime())[0];
      
      // Verificar se este pedido ainda não foi impresso (usando localStorage para controle)
      const pedidosImpressos = JSON.parse(localStorage.getItem('pedidosImpressos') || '[]');
      
      if (!pedidosImpressos.includes(ultimoPedido.id)) {
        const cliente = clientes.find(c => c.id === ultimoPedido.cliente_id);
        
        // Tentar imprimir automaticamente
        rawbtService.imprimirPedidoAutomatico(ultimoPedido, cliente).then((sucesso) => {
          if (sucesso) {
            // Marcar como impresso
            const novosImpressos = [...pedidosImpressos, ultimoPedido.id];
            localStorage.setItem('pedidosImpressos', JSON.stringify(novosImpressos));
            
            toast.success(`Pedido #${ultimoPedido.id} enviado para impressão automática!`);
            console.log(`Pedido #${ultimoPedido.id} impresso automaticamente no Rawbt`);
          } else {
            toast.error('Erro ao enviar pedido para impressão automática');
          }
        }).catch((error) => {
          console.error('Erro na impressão automática:', error);
          toast.error('Falha na impressão automática');
        });
      }
    }
  }, [pedidos, clientes]);
  
  const testarImpressora = async () => {
    try {
      const sucesso = await rawbtService.testarConexao();
      if (sucesso) {
        toast.success('Teste de impressão enviado para o Rawbt!');
      } else {
        toast.error('Falha ao enviar teste de impressão');
      }
    } catch (error) {
      console.error('Erro no teste da impressora:', error);
      toast.error('Erro ao testar impressora');
    }
  };
  
  const imprimirPedidoManual = async (pedidoId: number) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      toast.error('Pedido não encontrado');
      return;
    }
    
    const cliente = clientes.find(c => c.id === pedido.cliente_id);
    
    try {
      const sucesso = await rawbtService.imprimirPedidoAutomatico(pedido, cliente);
      if (sucesso) {
        toast.success(`Pedido #${pedidoId} enviado para impressão!`);
      } else {
        toast.error('Falha ao enviar pedido para impressão');
      }
    } catch (error) {
      console.error('Erro na impressão manual:', error);
      toast.error('Erro ao imprimir pedido');
    }
  };
  
  return {
    testarImpressora,
    imprimirPedidoManual,
    rawbtDisponivel: rawbtService.checkRawbtAvailability()
  };
};
