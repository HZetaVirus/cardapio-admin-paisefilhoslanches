
import { useState, useEffect } from 'react';
import { Cliente, Categoria, ItemCardapio, ConfiguracaoLoja, CurrentView, Adicional } from '@/types';
import { getAdicionais } from '@/services/adicionaisService';

export const useAppState = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
  const [configuracaoLoja, setConfiguracaoLoja] = useState<ConfiguracaoLoja | null>(null);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [currentView, setCurrentView] = useState<CurrentView>('login');
  const [loading, setLoading] = useState(true);

  // Load adicionais on component mount
  useEffect(() => {
    const loadAdicionais = async () => {
      try {
        const adicionaisData = await getAdicionais();
        setAdicionais(adicionaisData);
      } catch (error) {
        console.error('Erro ao carregar adicionais:', error);
        setAdicionais([]);
      }
    };

    loadAdicionais();
  }, []);

  return {
    clientes,
    setClientes,
    categorias,
    setCategorias,
    cardapio,
    setCardapio,
    configuracaoLoja,
    setConfiguracaoLoja,
    adicionais,
    setAdicionais,
    currentView,
    setCurrentView,
    loading,
    setLoading
  };
};
