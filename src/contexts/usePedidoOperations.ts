
import * as supabaseService from '@/services/supabaseService';
import { Cliente, FormaPagamento } from '@/types';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useCart } from '@/hooks/useCart';
import { useDataOperations } from '@/hooks/useDataOperations';
import { toast } from 'sonner';

interface UsePedidoOperationsProps {
  auth: ReturnType<typeof useSecureAuth>;
  cart: ReturnType<typeof useCart>;
  dataOps: ReturnType<typeof useDataOperations>;
  setClientes: (fn: (prev: Cliente[]) => Cliente[]) => void;
  setCurrentView: (view: any) => void;
}

export const usePedidoOperations = ({
  auth,
  cart,
  dataOps,
  setClientes,
  setCurrentView
}: UsePedidoOperationsProps) => {
  // Função para finalizar pedido
  const finalizarPedido = async (
    formaPagamento: FormaPagamento, 
    observacao: string, 
    trocoPara?: number, 
    dadosCliente?: Omit<Cliente, 'id' | 'data_ultimo_pedido'>
  ) => {
    try {
      let clienteParaPedido = auth.clienteAtual;
      
      // Se não há cliente atual mas há dados de cliente, cadastrar primeiro
      if (!auth.clienteAtual && dadosCliente) {
        const novoCliente = await auth.cadastrarCliente(dadosCliente);
        if (!novoCliente) {
          console.error('Falha ao cadastrar cliente durante o pedido');
          toast.error('Erro ao cadastrar cliente');
          return;
        }
        clienteParaPedido = novoCliente;
        setClientes(prev => [...prev, novoCliente]);
      }
      
      if (!clienteParaPedido || cart.carrinhoAtual.length === 0) {
        console.error('Cliente atual ou carrinho vazio');
        toast.error('Erro: Cliente ou carrinho vazio');
        return;
      }
      
      console.log('Finalizando pedido...');
      
      const valorTotal = cart.carrinhoAtual.reduce((total, item) => total + (item.preco * item.quantidade), 0);
      
      const novoPedido = {
        cliente_id: clienteParaPedido.id,
        itens: [...cart.carrinhoAtual],
        status: 'pendente' as const,
        forma_pagamento: formaPagamento,
        observacao,
        data_pedido: new Date().toISOString(),
        valor_total: valorTotal,
        troco_para: formaPagamento === 'dinheiro' ? trocoPara : undefined
      };
      
      const pedidoInserido = await supabaseService.insertPedido(novoPedido);
      
      if (pedidoInserido) {
        console.log('Pedido inserido com sucesso:', pedidoInserido);
        
        // Atualizar lista de pedidos
        dataOps.setPedidos(prev => [...prev, pedidoInserido]);
        
        // Atualizar data do último pedido do cliente
        const dataAtual = new Date().toISOString();
        const clienteAtualizado = {
          ...clienteParaPedido,
          data_ultimo_pedido: dataAtual
        };
        
        await supabaseService.updateCliente(clienteAtualizado);
        
        setClientes(prev => prev.map(c => 
          c.id === clienteParaPedido.id ? clienteAtualizado : c
        ));
        
        auth.setClienteAtual(clienteAtualizado);
        
        // Limpar carrinho e navegar
        cart.limparCarrinho();
        
        // Aguardar um pouco antes de navegar para garantir que o estado foi atualizado
        setTimeout(() => {
          setCurrentView('meusPedidos');
        }, 100);
        
        toast.success('Pedido realizado com sucesso!');
      } else {
        console.error('Falha ao inserir pedido');
        toast.error('Erro ao processar pedido');
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error('Erro inesperado ao finalizar pedido');
    }
  };

  return { finalizarPedido };
};
