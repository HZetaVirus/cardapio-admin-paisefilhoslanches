import { Cliente, Pedido, Avaliacao } from '@/types';

// Filtrar pedidos para mostrar apenas os do cliente logado
export const filterClientePedidos = (pedidos: Pedido[], clienteAtual: Cliente | null): Pedido[] => {
  if (!clienteAtual) return [];
  return pedidos.filter(pedido => pedido.cliente_id === clienteAtual.id);
};

// Verificar se o cliente pode editar uma avaliação
export const canEditAvaliacao = (avaliacao: Avaliacao, clienteAtual: Cliente | null): boolean => {
  if (!clienteAtual) return false;
  return avaliacao.cliente_id === clienteAtual.id;
};

// Verificar se o cliente pode ver seus próprios dados
export const canViewClienteData = (cliente: Cliente, clienteAtual: Cliente | null): boolean => {
  if (!clienteAtual) return false;
  return cliente.id === clienteAtual.id;
};

// Verificar se o cliente pode editar um pedido (apenas pedidos pendentes)
export const canEditPedido = (pedido: Pedido, clienteAtual: Cliente | null): boolean => {
  if (!clienteAtual) return false;
  return pedido.cliente_id === clienteAtual.id && pedido.status === 'pendente';
};
