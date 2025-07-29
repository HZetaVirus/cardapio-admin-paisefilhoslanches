import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  verificarElegibilidadeFidelidade,
  verificarCupomMesAtual,
  sortearPremio,
  criarCupomFidelidade,
  buscarCuponsAtivos,
  usarCupom,
  type CupomFidelidade,
  type Premio
} from '@/services/fidelityService';

export const useFidelity = () => {
  const { clienteAtual } = useApp();
  const [isElegivel, setIsElegivel] = useState(false);
  const [jaGanhouEsseMes, setJaGanhouEsseMes] = useState(false);
  const [cuponsAtivos, setCuponsAtivos] = useState<CupomFidelidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFidelityGame, setShowFidelityGame] = useState(false);

  // Chave para localStorage baseada no cliente
  const getStorageKey = () => `fidelity_played_${clienteAtual?.id}_${new Date().getMonth()}_${new Date().getFullYear()}`;

  // Verificar se já jogou este mês (localStorage)
  const jaJogouEsseMes = () => {
    if (!clienteAtual) return false;
    return localStorage.getItem(getStorageKey()) === 'true';
  };

  // Marcar como jogado este mês
  const marcarComoJogado = () => {
    if (!clienteAtual) return;
    localStorage.setItem(getStorageKey(), 'true');
  };

  // Verificar elegibilidade e cupons
  const verificarStatus = async () => {
    if (!clienteAtual) {
      console.log('useFidelity: Cliente não está logado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('useFidelity: Verificando status para cliente', clienteAtual.id);

      // Verificar se é elegível (2 pedidos em 30 dias)
      const elegivel = await verificarElegibilidadeFidelidade(clienteAtual.id);
      console.log('useFidelity: Cliente elegível?', elegivel);
      setIsElegivel(elegivel);

      // Verificar se já ganhou cupom este mês
      const jaGanhou = await verificarCupomMesAtual(clienteAtual.id);
      console.log('useFidelity: Cliente já ganhou este mês?', jaGanhou);
      setJaGanhouEsseMes(jaGanhou);

      // Buscar cupons ativos
      const cupons = await buscarCuponsAtivos(clienteAtual.id);
      console.log('useFidelity: Cupons ativos:', cupons.length);
      setCuponsAtivos(cupons);

      // Mostrar jogo se elegível e não ganhou este mês E não jogou ainda (localStorage)
      const jaJogou = jaJogouEsseMes();
      const shouldShowGame = elegivel && !jaGanhou && !jaJogou;
      console.log('useFidelity: Deve mostrar jogo?', shouldShowGame, { elegivel, jaGanhou, jaJogou });
      setShowFidelityGame(shouldShowGame);

    } catch (error) {
      console.error('Erro ao verificar status de fidelidade:', error);
    } finally {
      setLoading(false);
    }
  };

  // Jogar e ganhar prêmio
  const jogarFidelidade = async (): Promise<Premio | null> => {
    if (!clienteAtual || !isElegivel || jaGanhouEsseMes) {
      return null;
    }

    try {
      console.log('useFidelity: Jogando fidelidade para cliente', clienteAtual.id);
      
      // Sortear prêmio
      const premioSorteado = sortearPremio();
      console.log('useFidelity: Prêmio sorteado:', premioSorteado);

      // Criar cupom no banco
      const cupom = await criarCupomFidelidade(clienteAtual.id, premioSorteado);

      if (cupom) {
        console.log('useFidelity: Cupom criado, atualizando estados');
        
        // Marcar como jogado no localStorage
        marcarComoJogado();
        
        // Atualizar estados - IMPORTANTE: fazer isso imediatamente
        setJaGanhouEsseMes(true);
        setShowFidelityGame(false);
        setCuponsAtivos(prev => [cupom, ...prev]);

        console.log('useFidelity: Estados atualizados - showFidelityGame agora é false');
        return premioSorteado;
      }

      return null;
    } catch (error) {
      console.error('Erro ao jogar fidelidade:', error);
      return null;
    }
  };

  // Usar um cupom
  const aplicarCupom = async (cupomId: number): Promise<boolean> => {
    try {
      const sucesso = await usarCupom(cupomId);

      if (sucesso) {
        // Remover cupom da lista de ativos
        setCuponsAtivos(prev => prev.filter(cupom => cupom.id !== cupomId));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      return false;
    }
  };

  // Calcular desconto de um cupom
  const calcularDesconto = (cupom: CupomFidelidade, valorPedido: number): number => {
    if (cupom.premio_tipo === 'desconto' && cupom.premio_valor) {
      return (valorPedido * cupom.premio_valor) / 100;
    }
    return 0;
  };

  // Verificar se tem frete grátis
  const temFreteGratis = (): boolean => {
    return cuponsAtivos.some(cupom => 
      cupom.premio_tipo === 'frete_gratis' && !cupom.usado
    );
  };

  // Esconder notificação de fidelidade manualmente
  const esconderNotificacao = () => {
    console.log('useFidelity: Escondendo notificação manualmente');
    marcarComoJogado(); // Marcar como jogado para não aparecer mais
    setShowFidelityGame(false);
  };

  // Atualizar quando cliente mudar
  useEffect(() => {
    verificarStatus();
  }, [clienteAtual?.id]);

  // Função para resetar o jogo (apenas para testes)
  const resetarJogo = () => {
    if (!clienteAtual) return;
    localStorage.removeItem(getStorageKey());
    verificarStatus();
  };

  return {
    isElegivel,
    jaGanhouEsseMes,
    cuponsAtivos,
    loading,
    showFidelityGame,
    jogarFidelidade,
    aplicarCupom,
    calcularDesconto,
    temFreteGratis,
    verificarStatus,
    esconderNotificacao,
    resetarJogo
  };
};