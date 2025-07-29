
import type { Avaliacao } from "@/types";
import { withDDoSProtection, supabase } from "./baseService";

export const getAvaliacoes = async (): Promise<Avaliacao[]> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('avaliacao_itens')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar avaliações:', error);
      return [];
    }
    
    return data as Avaliacao[];
  });
};

export const insertAvaliacao = async (avaliacao: Omit<Avaliacao, 'id'>): Promise<Avaliacao | null> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('avaliacao_itens')
      .insert({
        item_id: avaliacao.item_id,
        cliente_id: avaliacao.cliente_id,
        avaliacao: avaliacao.avaliacao,
        comentario: avaliacao.comentario
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao inserir avaliação:', error);
      return null;
    }
    
    return data as Avaliacao;
  });
};
