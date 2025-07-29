
import { useState } from 'react';
import { Cliente, CurrentView } from '@/types';
import * as supabaseService from '@/services/supabaseService';
import { adminAuthService } from '@/services/adminAuthService';
import { toast } from 'sonner';

export const useAuth = () => {
  const [clienteAtual, setClienteAtual] = useState<Cliente | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const cadastrarCliente = async (cliente: Omit<Cliente, 'id' | 'data_ultimo_pedido'>) => {
    try {
      console.log("Tentando cadastrar cliente:", cliente);
      const novoCliente = await supabaseService.insertCliente(cliente);
      
      if (novoCliente) {
        console.log("Cliente cadastrado com sucesso:", novoCliente);
        setClienteAtual(novoCliente);
        return novoCliente;
      } else {
        console.error("Falha ao cadastrar cliente: novoCliente é null");
        return null;
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      return null;
    }
  };

  const loginCliente = async (telefone: string) => {
    const cliente = await supabaseService.getClienteByTelefone(telefone);
    
    if (cliente) {
      console.log('Cliente logado:', cliente);
      setClienteAtual(cliente);
      return true;
    }
    return false;
  };

  const loginAdmin = async (email: string, senha: string) => {
    try {
      const adminUser = await adminAuthService.verifyAdminCredentials(email, senha);
      
      if (adminUser) {
        setIsAdmin(true);
        // Usar sessionStorage para admin (mais seguro)
        sessionStorage.setItem('isAdmin', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify(adminUser));
        toast.success('Login de administrador realizado com sucesso!');
        return true;
      } else {
        toast.error('Credenciais incorretas');
        return false;
      }
    } catch (error) {
      console.error('Erro no login do admin:', error);
      toast.error('Erro no login do administrador');
      return false;
    }
  };

  const logout = (setCurrentView?: (view: CurrentView) => void) => {
    console.log('Fazendo logout');
    setClienteAtual(null);
    setIsAdmin(false);
    localStorage.removeItem('clienteAtual');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminUser');
    localStorage.removeItem('carrinhoAtual');
    
    // Redirecionar para a página de login
    if (setCurrentView) {
      setCurrentView('login');
    }
  };

  return {
    clienteAtual,
    setClienteAtual,
    isAdmin,
    setIsAdmin,
    cadastrarCliente,
    loginCliente,
    loginAdmin,
    logout
  };
};
