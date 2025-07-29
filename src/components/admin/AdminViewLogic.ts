
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Pedido, StatusPedido } from "@/types";
import { toast } from "sonner";
import { PrintService } from "@/services/printService";

export const useAdminViewLogic = () => {
  const { pedidos, atualizarStatusPedido, clientes, logout } = useApp();
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido>('pendente');
  const [currentTab, setCurrentTab] = useState<string>("pedidos");
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [clienteDialogOpen, setClienteDialogOpen] = useState(false);
  
  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente');
  const pedidosAceitos = pedidos.filter(p => p.status === 'pedido aceito');
  const pedidosNaChapa = pedidos.filter(p => p.status === 'indo para a chapa agora');
  const pedidosEmEntrega = pedidos.filter(p => p.status === 'saiu da chapa para sua casa');
  const pedidosConcluidos = pedidos.filter(p => p.status === 'pedidos concluídos');
  const pedidosCancelados = pedidos.filter(p => p.status === 'pedidos cancelados');
  
  const handleImprimirPedido = (pedido: Pedido) => {
    const cliente = clientes.find(c => c.id === pedido.cliente_id);
    
    try {
      PrintService.imprimirPedido(pedido, cliente);
      toast.success(`Abrindo janela de impressão para pedido #${pedido.id}`);
    } catch (error) {
      console.error('Erro ao imprimir pedido:', error);
      toast.error('Erro ao abrir janela de impressão');
    }
  };
  
  const handleShowClienteDetails = (clienteId: number) => {
    setSelectedClienteId(clienteId);
    setClienteDialogOpen(true);
  };
  
  const prepararConteudoImpressao = (pedido: Pedido) => {
    const cliente = clientes.find(c => c.id === pedido.cliente_id);
    const data = new Date(pedido.data_pedido).toLocaleString('pt-BR');
    
    let conteudo = `
      *** COMANDA DE PEDIDO ***
      
      Pedido #${pedido.id}
      Data: ${data}
      
      Cliente: ${cliente?.nome_completo || 'Cliente não encontrado'}
      Telefone: ${cliente?.telefone || 'N/A'}
      Endereço: ${cliente?.endereco || 'N/A'}
      
      ITENS:
    `;
    
    pedido.itens.forEach(item => {
      conteudo += `
      ${item.quantidade}x ${item.nome_item} - R$ ${(item.preco * item.quantidade).toFixed(2)}
      ${item.observacao ? `   Obs: ${item.observacao}` : ''}
      `;
    });
    
    conteudo += `
      -----------------------
      TOTAL: R$ ${pedido.valor_total.toFixed(2)}
      
      Forma de Pagamento: ${pedido.forma_pagamento}
      ${pedido.forma_pagamento === 'dinheiro' && pedido.troco_para ? `Troco para: R$ ${pedido.troco_para.toFixed(2)}` : ''}
      
      Observação: ${pedido.observacao || 'Nenhuma observação'}
    `;
    
    return conteudo;
  };
  
  const statusOptions = [
    { 
      value: 'pendente' as StatusPedido, 
      label: 'Pendente', 
      count: pedidosPendentes.length, 
      color: 'bg-gray-200 dark:bg-gray-700',
      emoji: '⏳'
    },
    { 
      value: 'pedido aceito' as StatusPedido, 
      label: 'Aceito', 
      count: pedidosAceitos.length, 
      color: 'bg-blue-200 dark:bg-blue-900',
      emoji: '✅'
    },
    { 
      value: 'indo para a chapa agora' as StatusPedido, 
      label: 'Na Chapa', 
      count: pedidosNaChapa.length, 
      color: 'bg-yellow-200 dark:bg-yellow-900',
      emoji: '🔥'
    },
    { 
      value: 'saiu da chapa para sua casa' as StatusPedido, 
      label: 'Saiu da Chapa', 
      count: pedidosEmEntrega.length, 
      color: 'bg-green-200 dark:bg-green-900',
      emoji: '🚚'
    },
    { 
      value: 'pedidos concluídos' as StatusPedido, 
      label: 'Concluídos', 
      count: pedidosConcluidos.length, 
      color: 'bg-emerald-200 dark:bg-emerald-900',
      emoji: '🎉'
    },
    { 
      value: 'pedidos cancelados' as StatusPedido, 
      label: 'Cancelados', 
      count: pedidosCancelados.length, 
      color: 'bg-red-200 dark:bg-red-900',
      emoji: '❌'
    },
  ];

  const selectedCliente = selectedClienteId ? clientes.find(c => c.id === selectedClienteId) : null;
  const currentPedidosFiltrados = pedidos.filter(p => p.status === filtroStatus);

  return {
    filtroStatus,
    setFiltroStatus,
    currentTab,
    setCurrentTab,
    selectedClienteId,
    clienteDialogOpen,
    setClienteDialogOpen,
    statusOptions,
    selectedCliente,
    currentPedidosFiltrados,
    handleImprimirPedido,
    handleShowClienteDetails,
    atualizarStatusPedido,
    clientes,
    logout
  };
};
