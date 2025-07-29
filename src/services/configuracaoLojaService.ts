
import type { ConfiguracaoLoja, ModoOperacao } from "@/types";
import { withDDoSProtection, supabase } from "./baseService";

export const getConfiguracaoLoja = async (): Promise<ConfiguracaoLoja | null> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('configuracao_loja')
      .select('*')
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar configuração da loja:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Converter feriados_fechamento de Json para string[]
    let feriadosFechamento: string[] = [];
    if (data.feriados_fechamento) {
      if (Array.isArray(data.feriados_fechamento)) {
        feriadosFechamento = data.feriados_fechamento.filter(item => typeof item === 'string') as string[];
      }
    }
    
    return {
      logoUrl: data.logo || '',
      logoBgColor: data.logo_bg_color || '#f3f4f6',
      descricao: data.descricao || '',
      endereco: data.endereco || '',
      horarioFuncionamento: data.horario_funcionamento || '',
      instagramUrl: '',
      cardapioAtivo: data.cardapio_ativo ?? true,
      modoOperacao: (data.modo_operacao as ModoOperacao) || 'automatico',
      ultimaVerificacaoAutomatica: data.ultima_verificacao_automatica || new Date().toISOString(),
      feriadosFechamento
    };
  });
};

export const updateConfiguracaoLoja = async (config: ConfiguracaoLoja): Promise<boolean> => {
  return await withDDoSProtection(async () => {
    // Verificar se já existe alguma configuração
    const { data } = await supabase
      .from('configuracao_loja')
      .select('id')
      .maybeSingle();
    
    const configData = {
      logo: config.logoUrl,
      logo_bg_color: config.logoBgColor,
      descricao: config.descricao,
      endereco: config.endereco,
      horario_funcionamento: config.horarioFuncionamento,
      cardapio_ativo: config.cardapioAtivo,
      modo_operacao: config.modoOperacao,
      ultima_verificacao_automatica: config.ultimaVerificacaoAutomatica,
      feriados_fechamento: config.feriadosFechamento
    };
    
    let error;
    
    if (data) {
      // Atualizar configuração existente
      const result = await supabase
        .from('configuracao_loja')
        .update(configData)
        .eq('id', data.id);
      
      error = result.error;
    } else {
      // Inserir nova configuração
      const result = await supabase
        .from('configuracao_loja')
        .insert(configData);
      
      error = result.error;
    }
    
    if (error) {
      console.error('Erro ao atualizar configuração da loja:', error);
      return false;
    }
    
    return true;
  });
};
