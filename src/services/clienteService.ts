
import type { Cliente } from "@/types";
import { withDDoSProtection, supabase } from "./baseService";

export const getClientes = async (): Promise<Cliente[]> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
    
    return data as Cliente[];
  });
};

export const getClienteByTelefone = async (telefone: string): Promise<Cliente | null> => {
  return await withDDoSProtection(async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefone', telefone)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar cliente por telefone:', error);
      return null;
    }
    
    return data as Cliente | null;
  });
};

export const insertCliente = async (cliente: Omit<Cliente, 'id' | 'data_ultimo_pedido'>): Promise<Cliente | null> => {
  return await withDDoSProtection(async () => {
    // Check if cliente with this phone number already exists
    const existingCliente = await getClienteByTelefone(cliente.telefone);
    if (existingCliente) {
      console.log('Cliente já existe com este telefone:', existingCliente);
      return existingCliente;
    }
    
    console.log('Inserindo novo cliente:', cliente);
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        nome_completo: cliente.nome_completo,
        endereco: cliente.endereco,
        telefone: cliente.telefone
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao inserir cliente:', error);
      return null;
    }
    
    console.log('Cliente inserido com sucesso:', data);
    return data as Cliente;
  });
};

export const updateCliente = async (cliente: Cliente): Promise<boolean> => {
  return await withDDoSProtection(async () => {
    const { error } = await supabase
      .from('clientes')
      .update({
        nome_completo: cliente.nome_completo,
        endereco: cliente.endereco,
        telefone: cliente.telefone,
        data_ultimo_pedido: cliente.data_ultimo_pedido
      })
      .eq('id', cliente.id);
    
    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      return false;
    }
    
    return true;
  });
};
