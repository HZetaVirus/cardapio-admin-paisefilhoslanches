
import type { Categoria } from "@/types";
import { withDDoSProtection, supabase } from "./baseService";

export const getCategorias = async (): Promise<Categoria[]> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
    
    return data as Categoria[];
  });
};

export const insertCategoria = async (categoria: Omit<Categoria, 'id'>): Promise<Categoria | null> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('categorias')
      .insert({
        nome_categoria: categoria.nome_categoria
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao inserir categoria:', error);
      return null;
    }
    
    return data as Categoria;
  });
};
