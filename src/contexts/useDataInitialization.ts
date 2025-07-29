
import { useEffect } from 'react';
import * as supabaseService from '@/services/supabaseService';
import { filterClientePedidos } from '@/services/securityService';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useCart } from '@/hooks/useCart';
import { useDataOperations } from '@/hooks/useDataOperations';
import { Cliente, Categoria, ItemCardapio, ConfiguracaoLoja, CurrentView } from '@/types';

interface UseDataInitializationProps {
  setLoading: (loading: boolean) => void;
  setCategorias: (categorias: Categoria[]) => void;
  setCardapio: (cardapio: ItemCardapio[]) => void;
  setClientes: (clientes: Cliente[]) => void;
  setConfiguracaoLoja: (config: ConfiguracaoLoja | null) => void;
  auth: ReturnType<typeof useSecureAuth>;
  cart: ReturnType<typeof useCart>;
  dataOps: ReturnType<typeof useDataOperations>;
  setCurrentView?: (view: CurrentView) => void;
}

// Função para filtrar pedidos arquivados
const filterPedidosNaoArquivados = (pedidos: any[]) => {
  return pedidos.filter(pedido => 
    !pedido.observacao || !pedido.observacao.includes('ARQUIVADO_')
  );
};

export const useDataInitialization = ({
  setLoading,
  setCategorias,
  setCardapio,
  setClientes,
  setConfiguracaoLoja,
  auth,
  cart,
  dataOps,
  setCurrentView
}: UseDataInitializationProps) => {
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Carregar categorias
        const categoriasData = await supabaseService.getCategorias();
        setCategorias(categoriasData);
        
        // Carregar cardápio
        const cardapioData = await supabaseService.getCardapio();
        setCardapio(cardapioData);
        
        // Carregar clientes
        const clientesData = await supabaseService.getClientes();
        setClientes(clientesData);
        
        // Carregar pedidos e filtrar arquivados
        const pedidosData = await supabaseService.getPedidos();
        const pedidosNaoArquivados = filterPedidosNaoArquivados(pedidosData);
        dataOps.setPedidos(pedidosNaoArquivados);
        
        console.log(`Carregados ${pedidosData.length} pedidos, ${pedidosNaoArquivados.length} não arquivados exibidos`);
        
        // Carregar avaliações
        const avaliacoesData = await supabaseService.getAvaliacoes();
        dataOps.setAvaliacoes(avaliacoesData);
        
        // Carregar configuração da loja
        const configLoja = await supabaseService.getConfiguracaoLoja();
        setConfiguracaoLoja(configLoja);
        
        // Auth initialization is now handled by useSecureAuth hook
        // Check current view and redirect if needed
        if (!auth.clienteAtual && !auth.isAdmin && setCurrentView) {
          setCurrentView('login');
        }
        
      } catch (error) {
        console.error("Erro ao carregar dados do Supabase:", error);
        // Em caso de erro, ainda tentar restaurar o estado do localStorage
        if (setCurrentView) {
          setCurrentView('login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setLoading, setCategorias, setCardapio, setClientes, setConfiguracaoLoja, setCurrentView]); // Dependências estáveis
};
