
import type { ItemCardapio } from "@/types";
import { withDDoSProtection, supabase } from "./baseService";

export const getCardapio = async (): Promise<ItemCardapio[]> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('cardapio')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar cardápio:', error);
      return [];
    }
    
    return data as ItemCardapio[];
  });
};

export const updateItemCardapio = async (item: ItemCardapio): Promise<boolean> => {
  return await withDDoSProtection(async () => {
    const { error } = await supabase
      .from('cardapio')
      .update({
        nome_item: item.nome_item,
        descricao: item.descricao,
        preco: item.preco,
        categoria_id: item.categoria_id,
        imagem: item.imagem,
        is_featured: item.is_featured || false
      })
      .eq('id', item.id);
    
    if (error) {
      console.error('Erro ao atualizar item do cardápio:', error);
      return false;
    }
    
    return true;
  });
};

export const getFeaturedItems = async (): Promise<ItemCardapio[]> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('cardapio')
      .select('*')
      .eq('is_featured', true)
      .limit(6);
    
    if (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      return [];
    }
    
    return data as ItemCardapio[];
  });
};

export const toggleFeaturedStatus = async (itemId: number, isFeatured: boolean): Promise<boolean> => {
  return await withDDoSProtection(async () => {
    const { error } = await supabase
      .from('cardapio')
      .update({ is_featured: isFeatured })
      .eq('id', itemId);
    
    if (error) {
      console.error('Erro ao alterar status de destaque:', error);
      return false;
    }
    
    return true;
  });
};

export const deleteItemCardapio = async (itemId: number): Promise<boolean> => {
  return await withDDoSProtection(async () => {
    const { error } = await supabase
      .from('cardapio')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Erro ao deletar item do cardápio:', error);
      return false;
    }
    
    return true;
  });
};

export const insertItemCardapio = async (item: Omit<ItemCardapio, 'id'>): Promise<ItemCardapio | null> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('cardapio')
      .insert({
        nome_item: item.nome_item,
        descricao: item.descricao,
        preco: item.preco,
        categoria_id: item.categoria_id,
        imagem: item.imagem,
        is_featured: item.is_featured || false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao inserir item no cardápio:', error);
      return null;
    }
    
    return data as ItemCardapio;
  });
};
