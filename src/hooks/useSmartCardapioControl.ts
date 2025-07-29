
import { useEffect, useCallback, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { isStoreOpen } from '@/utils/storeHours';
import type { ModoOperacao } from '@/types';

export const useSmartCardapioControl = () => {
  const { configuracaoLoja, atualizarConfiguracaoLoja } = useApp();
  const [isChecking, setIsChecking] = useState(false);

  // Verifica se é feriado
  const isFeriado = useCallback((data: Date): boolean => {
    if (!configuracaoLoja?.feriadosFechamento) return false;
    
    const dataString = data.toISOString().split('T')[0]; // YYYY-MM-DD
    return configuracaoLoja.feriadosFechamento.includes(dataString);
  }, [configuracaoLoja?.feriadosFechamento]);

  // Calcula o status final do cardápio baseado na lógica de prioridade
  const calculateCardapioStatus = useCallback((): boolean => {
    if (!configuracaoLoja) return false;

    const agora = new Date();
    const horaAtual = isStoreOpen(configuracaoLoja.horarioFuncionamento);
    const ehFeriado = isFeriado(agora);

    // Prioridade 1: Fechado Forçado (sempre fechado)
    if (configuracaoLoja.modoOperacao === 'fechado_forcado') {
      return false;
    }

    // Prioridade 2: Feriados (sempre fechado em feriados)
    if (ehFeriado) {
      return false;
    }

    // Prioridade 3: Manual (ignora horário de funcionamento)
    if (configuracaoLoja.modoOperacao === 'manual') {
      return configuracaoLoja.cardapioAtivo;
    }

    // Prioridade 4: Automático (baseado no horário)
    if (configuracaoLoja.modoOperacao === 'automatico') {
      return horaAtual;
    }

    return false;
  }, [configuracaoLoja, isFeriado]);

  // Atualiza o status do cardápio automaticamente
  const updateCardapioStatus = useCallback(async () => {
    if (!configuracaoLoja || isChecking) return;

    setIsChecking(true);
    
    try {
      const novoStatus = calculateCardapioStatus();
      
      // Só atualiza se o status mudou e estamos no modo automático
      if (
        configuracaoLoja.modoOperacao === 'automatico' && 
        configuracaoLoja.cardapioAtivo !== novoStatus
      ) {
        const novaConfig = {
          ...configuracaoLoja,
          cardapioAtivo: novoStatus,
          ultimaVerificacaoAutomatica: new Date().toISOString()
        };

        await atualizarConfiguracaoLoja(novaConfig);
        console.log(`Cardápio ${novoStatus ? 'ativado' : 'desativado'} automaticamente`);
      }
    } catch (error) {
      console.error('Erro ao atualizar status automático do cardápio:', error);
    } finally {
      setIsChecking(false);
    }
  }, [configuracaoLoja, calculateCardapioStatus, atualizarConfiguracaoLoja, isChecking]);

  // Força uma atualização do modo de operação
  const setModoOperacao = useCallback(async (novoModo: ModoOperacao, statusManual?: boolean) => {
    if (!configuracaoLoja) return;

    const novaConfig = {
      ...configuracaoLoja,
      modoOperacao: novoModo,
      cardapioAtivo: statusManual !== undefined ? statusManual : configuracaoLoja.cardapioAtivo,
      ultimaVerificacaoAutomatica: new Date().toISOString()
    };

    await atualizarConfiguracaoLoja(novaConfig);
  }, [configuracaoLoja, atualizarConfiguracaoLoja]);

  // Adiciona/remove feriados
  const toggleFeriado = useCallback(async (data: string) => {
    if (!configuracaoLoja) return;

    const feriados = [...(configuracaoLoja.feriadosFechamento || [])];
    const index = feriados.indexOf(data);
    
    if (index > -1) {
      feriados.splice(index, 1);
    } else {
      feriados.push(data);
    }

    const novaConfig = {
      ...configuracaoLoja,
      feriadosFechamento: feriados
    };

    await atualizarConfiguracaoLoja(novaConfig);
  }, [configuracaoLoja, atualizarConfiguracaoLoja]);

  // Timer para verificação automática a cada minuto
  useEffect(() => {
    if (configuracaoLoja?.modoOperacao === 'automatico') {
      updateCardapioStatus();
      
      const interval = setInterval(() => {
        updateCardapioStatus();
      }, 60000); // Verifica a cada minuto

      return () => clearInterval(interval);
    }
  }, [configuracaoLoja?.modoOperacao, updateCardapioStatus]);

  return {
    cardapioStatus: calculateCardapioStatus(),
    modoOperacao: configuracaoLoja?.modoOperacao || 'automatico',
    isChecking,
    setModoOperacao,
    toggleFeriado,
    isFeriado: isFeriado(new Date()),
    feriadosFechamento: configuracaoLoja?.feriadosFechamento || []
  };
};
