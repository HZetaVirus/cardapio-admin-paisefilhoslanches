import { supabase } from '@/integrations/supabase/client';

export interface Premio {
  id: number;
  nome: string;
  descricao: string;
  peso: number; // Probabilidade (maior = mais comum)
  icone: string;
  tipo: 'desconto' | 'produto_gratis' | 'frete_gratis';
  valor?: number; // Para descontos em %
  produto_id?: number; // Para produtos grátis
}

export interface CupomFidelidade {
  id: number;
  cliente_id: number;
  premio_id: number;
  premio_nome: string;
  premio_descricao: string;
  premio_tipo: string;
  premio_valor?: number;
  produto_id?: number;
  usado: boolean;
  data_ganho: string;
  data_uso?: string;
  data_expiracao: string;
}

// Prêmios disponíveis
export const PREMIOS_DISPONIVEIS: Premio[] = [
  {
    id: 1,
    nome: "Bacon Grátis",
    descricao: "Bacon grátis na sua próxima compra",
    peso: 25,
    icone: "🥓",
    tipo: "produto_gratis"
  },
  {
    id: 2,
    nome: "Batata Frita Grátis",
    descricao: "Porção de batata frita grátis",
    peso: 25,
    icone: "🍟",
    tipo: "produto_gratis"
  },
  {
    id: 3,
    nome: "10% de Desconto",
    descricao: "10% de desconto na próxima compra",
    peso: 20,
    icone: "💰",
    tipo: "desconto",
    valor: 10
  },
  {
    id: 4,
    nome: "Refrigerante Grátis",
    descricao: "Refrigerante grátis na próxima compra",
    peso: 15,
    icone: "🥤",
    tipo: "produto_gratis"
  },
  {
    id: 5,
    nome: "Frete Grátis",
    descricao: "Entrega grátis na próxima compra",
    peso: 10,
    icone: "🚚",
    tipo: "frete_gratis"
  },
  {
    id: 6,
    nome: "Hambúrguer Grátis",
    descricao: "Hambúrguer grátis na próxima compra",
    peso: 5,
    icone: "🍔",
    tipo: "produto_gratis"
  }
];

// Verificar se cliente é elegível (2 pedidos nos últimos 30 dias)
export const verificarElegibilidadeFidelidade = async (clienteId: number): Promise<boolean> => {
  try {
    console.log(`fidelityService: Verificando elegibilidade para cliente ${clienteId}`);

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    console.log(`fidelityService: Data limite: ${dataLimite.toISOString()}`);

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, data_pedido, status')
      .eq('cliente_id', clienteId)
      .gte('data_pedido', dataLimite.toISOString())
      .neq('status', 'pedidos cancelados');

    if (error) {
      console.error('fidelityService: Erro na query:', error);
      throw error;
    }

    console.log(`fidelityService: Pedidos encontrados:`, pedidos);
    console.log(`fidelityService: Cliente ${clienteId} tem ${pedidos?.length || 0} pedidos nos últimos 30 dias`);

    const isElegivel = (pedidos?.length || 0) >= 2;
    console.log(`fidelityService: Cliente elegível? ${isElegivel}`);

    return isElegivel;
  } catch (error) {
    console.error('fidelityService: Erro ao verificar elegibilidade:', error);
    return false;
  }
};

// Verificar se cliente já ganhou cupom no mês atual
export const verificarCupomMesAtual = async (clienteId: number): Promise<boolean> => {
  try {
    console.log(`fidelityService: Verificando cupom do mês para cliente ${clienteId}`);

    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    console.log(`fidelityService: Início do mês: ${inicioMes.toISOString()}`);

    const { data: cupons, error } = await supabase
      .from('cupons_fidelidade')
      .select('id, data_ganho')
      .eq('cliente_id', clienteId)
      .gte('data_ganho', inicioMes.toISOString());

    if (error) {
      console.log('fidelityService: Erro na query de cupons:', error);
      return false;
    }

    console.log(`fidelityService: Cupons encontrados este mês:`, cupons);
    const jaGanhou = (cupons?.length || 0) > 0;
    console.log(`fidelityService: Cliente já ganhou cupom este mês? ${jaGanhou}`);

    return jaGanhou;
  } catch (error) {
    console.error('fidelityService: Erro ao verificar cupom do mês:', error);
    return false;
  }
};

// Sortear prêmio baseado no peso
export const sortearPremio = (): Premio => {
  const pesoTotal = PREMIOS_DISPONIVEIS.reduce((total, premio) => total + premio.peso, 0);
  const numeroSorteado = Math.random() * pesoTotal;

  let pesoAcumulado = 0;
  for (const premio of PREMIOS_DISPONIVEIS) {
    pesoAcumulado += premio.peso;
    if (numeroSorteado <= pesoAcumulado) {
      return premio;
    }
  }

  // Fallback (não deveria acontecer)
  return PREMIOS_DISPONIVEIS[0];
};

// Criar cupom de fidelidade
export const criarCupomFidelidade = async (clienteId: number, premio: Premio): Promise<CupomFidelidade | null> => {
  try {
    console.log(`fidelityService: Criando cupom para cliente ${clienteId}, prêmio:`, premio);

    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 30);

    const { data, error } = await supabase
      .from('cupons_fidelidade')
      .insert({
        cliente_id: clienteId,
        premio_id: premio.id,
        premio_nome: premio.nome,
        premio_descricao: premio.descricao,
        premio_tipo: premio.tipo,
        premio_valor: premio.valor,
        produto_id: premio.produto_id,
        usado: false,
        data_expiracao: dataExpiracao.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`fidelityService: Cupom criado com sucesso:`, data);
    return data;
  } catch (error) {
    console.error('fidelityService: Erro ao criar cupom:', error);
    return null;
  }
};

// Buscar cupons ativos do cliente
export const buscarCuponsAtivos = async (clienteId: number): Promise<CupomFidelidade[]> => {
  try {
    console.log(`fidelityService: Buscando cupons ativos para cliente ${clienteId}`);

    const agora = new Date().toISOString();

    const { data: cupons, error } = await supabase
      .from('cupons_fidelidade')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('usado', false)
      .gt('data_expiracao', agora)
      .order('data_ganho', { ascending: false });

    if (error) throw error;

    console.log(`fidelityService: Cupons ativos encontrados:`, cupons);
    return cupons || [];
  } catch (error) {
    console.error('fidelityService: Erro ao buscar cupons:', error);
    return [];
  }
};

// Usar cupom
export const usarCupom = async (cupomId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cupons_fidelidade')
      .update({
        usado: true,
        data_uso: new Date().toISOString()
      })
      .eq('id', cupomId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Erro ao usar cupom:', error);
    return false;
  }
};