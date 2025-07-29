
import React, { createContext, useContext } from 'react';
import { filterClientePedidos } from '@/services/securityService';
import { AppContextType } from './types';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useCart } from '@/hooks/useCart';
import { useDataOperations } from '@/hooks/useDataOperations';
import { useAppState } from './useAppState';
import { useDataInitialization } from './useDataInitialization';
import { useLocalStoragePersistence } from './useLocalStoragePersistence';
import { usePedidoOperations } from './usePedidoOperations';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados principais
  const {
    clientes,
    setClientes,
    categorias,
    setCategorias,
    cardapio,
    setCardapio,
    configuracaoLoja,
    setConfiguracaoLoja,
    currentView,
    setCurrentView,
    loading,
    setLoading,
    adicionais
  } = useAppState();
  
  // Hooks customizados com autenticação segura
  const auth = useSecureAuth();
  const cart = useCart();
  const dataOps = useDataOperations();
  
  // Inicialização dos dados com persistência aprimorada
  useDataInitialization({
    setLoading,
    setCategorias,
    setCardapio,
    setClientes,
    setConfiguracaoLoja,
    auth,
    cart,
    dataOps,
    setCurrentView
  });
  
  // Persistência no localStorage
  useLocalStoragePersistence(auth, cart);
  
  // Operações de pedidos
  const { finalizarPedido } = usePedidoOperations({
    auth,
    cart,
    dataOps,
    setClientes,
    setCurrentView
  });
  
  // Função para obter pedidos do cliente atual (com segurança)
  const getClientePedidos = () => {
    return filterClientePedidos(dataOps.pedidos, auth.clienteAtual);
  };

  // Função de logout que inclui redirecionamento
  const handleLogout = () => {
    auth.logout(setCurrentView);
  };

  const value: AppContextType = {
    clientes,
    pedidos: dataOps.pedidos,
    categorias,
    cardapio,
    avaliacoes: dataOps.avaliacoes,
    configuracaoLoja,
    adicionais,
    clienteAtual: auth.clienteAtual,
    adminUser: auth.adminUser,
    isAdmin: auth.isAdmin,
    carrinhoAtual: cart.carrinhoAtual,
    cadastrarCliente: auth.cadastrarCliente,
    loginCliente: auth.loginCliente,
    loginAdmin: auth.loginAdmin,
    logout: handleLogout,
    adicionarAoCarrinho: cart.adicionarAoCarrinho,
    removerDoCarrinho: cart.removerDoCarrinho,
    atualizarQuantidadeCarrinho: cart.atualizarQuantidadeCarrinho,
    finalizarPedido,
    atualizarStatusPedido: dataOps.atualizarStatusPedido,
    avaliarItem: (itemId: number, avaliacao: number, comentario: string) => {
      if (auth.clienteAtual) {
        dataOps.avaliarItem(itemId, avaliacao, comentario, auth.clienteAtual.id);
      }
    },
    adicionarItemCardapio: (item) => dataOps.adicionarItemCardapio(item, setCardapio),
    atualizarConfiguracaoLoja: (config) => dataOps.atualizarConfiguracaoLoja(config, setConfiguracaoLoja),
    currentView,
    setCurrentView,
    loading,
    setPedidos: dataOps.setPedidos,
    setAvaliacoes: dataOps.setAvaliacoes,
    getClientePedidos
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Re-export all types for backward compatibility
export type {
  Cliente,
  Categoria,
  ItemCardapio,
  ConfiguracaoLoja,
  FormaPagamento,
  CurrentView
} from '@/types';

export type {
  Pedido,
  ItemPedido,
  Avaliacao,
  StatusPedido
} from '@/types';
