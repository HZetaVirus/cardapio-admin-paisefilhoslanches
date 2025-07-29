
import { useState, useEffect } from 'react';
import { Cliente, CurrentView } from '@/types';
import * as supabaseService from '@/services/supabaseService';
import { adminAuthService, AdminUser } from '@/services/adminAuthService';
import { toast } from 'sonner';

export const useSecureAuth = () => {
  const [clienteAtual, setClienteAtual] = useState<Cliente | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Initialize auth state from secure session storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check for admin session (more secure storage)
        const adminSession = sessionStorage.getItem('admin_session');
        if (adminSession) {
          const parsedAdmin = JSON.parse(adminSession);
          // Validate session hasn't expired (24 hours)
          const sessionTime = new Date(parsedAdmin.loginTime).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setAdminUser(parsedAdmin.user);
            setIsAdmin(true);
            console.log('Sessão admin restaurada:', parsedAdmin.user.email);
            return;
          } else {
            console.log('Sessão admin expirada, removendo...');
            sessionStorage.removeItem('admin_session');
          }
        }

        // Check for client session
        const clientSession = localStorage.getItem('clienteAtual');
        if (clientSession) {
          const parsedClient = JSON.parse(clientSession);
          setClienteAtual(parsedClient);
          console.log('Sessão cliente restaurada:', parsedClient.nome_completo);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Clear potentially corrupted data
        sessionStorage.removeItem('admin_session');
        localStorage.removeItem('clienteAtual');
      }
    };

    initializeAuth();
  }, []);

  const cadastrarCliente = async (cliente: Omit<Cliente, 'id' | 'data_ultimo_pedido'>) => {
    try {
      setAuthLoading(true);
      console.log("Tentando cadastrar cliente:", cliente);
      
      // Input validation
      if (!cliente.nome_completo?.trim() || !cliente.telefone?.trim() || !cliente.endereco?.trim()) {
        toast.error("Todos os campos são obrigatórios");
        return null;
      }

      // Sanitize input
      const sanitizedCliente = {
        ...cliente,
        nome_completo: cliente.nome_completo.trim(),
        telefone: cliente.telefone.replace(/\D/g, ''), // Remove non-digits
        endereco: cliente.endereco.trim()
      };

      const novoCliente = await supabaseService.insertCliente(sanitizedCliente);
      
      if (novoCliente) {
        console.log("Cliente cadastrado com sucesso:", novoCliente);
        setClienteAtual(novoCliente);
        localStorage.setItem('clienteAtual', JSON.stringify(novoCliente));
        return novoCliente;
      } else {
        console.error("Falha ao cadastrar cliente: novoCliente é null");
        toast.error("Erro ao cadastrar cliente");
        return null;
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Erro inesperado ao cadastrar cliente");
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginCliente = async (telefone: string) => {
    try {
      setAuthLoading(true);
      
      if (!telefone?.trim()) {
        toast.error("Telefone é obrigatório");
        return false;
      }

      // Sanitize phone number
      const sanitizedPhone = telefone.replace(/\D/g, '');
      
      if (sanitizedPhone.length < 10) {
        toast.error("Telefone deve ter pelo menos 10 dígitos");
        return false;
      }

      const cliente = await supabaseService.getClienteByTelefone(sanitizedPhone);
      
      if (cliente) {
        console.log('Cliente logado:', cliente);
        setClienteAtual(cliente);
        localStorage.setItem('clienteAtual', JSON.stringify(cliente));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro inesperado no login");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      
      if (!email?.trim() || !password?.trim()) {
        toast.error("Email e senha são obrigatórios");
        return false;
      }

      // Input validation for email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Email inválido");
        return false;
      }

      console.log('Tentando login admin para:', email);
      const adminUser = await adminAuthService.verifyAdminCredentials(email, password);
      
      if (adminUser) {
        console.log('Login admin bem-sucedido:', adminUser);
        setAdminUser(adminUser);
        setIsAdmin(true);
        
        // Store in session storage with timestamp (more secure than localStorage for admin)
        const adminSession = {
          user: adminUser,
          loginTime: new Date().toISOString()
        };
        sessionStorage.setItem('admin_session', JSON.stringify(adminSession));
        
        toast.success("Login de administrador realizado com sucesso!");
        return true;
      } else {
        console.log('Credenciais de admin incorretas');
        toast.error("Credenciais de administrador incorretas");
        return false;
      }
    } catch (error) {
      console.error("Erro no login do admin:", error);
      toast.error("Erro inesperado no login do administrador");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = (setCurrentView?: (view: CurrentView) => void) => {
    console.log('Fazendo logout seguro');
    
    // Clear all auth states
    setClienteAtual(null);
    setAdminUser(null);
    setIsAdmin(false);
    
    // Clear all storage
    localStorage.removeItem('clienteAtual');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminCredentials'); // Remove old insecure storage
    localStorage.removeItem('carrinhoAtual');
    sessionStorage.removeItem('admin_session');
    
    // Redirecionar para a página de login
    if (setCurrentView) {
      setCurrentView('login');
    }
    
    toast.success("Logout realizado com sucesso");
  };

  return {
    clienteAtual,
    setClienteAtual,
    adminUser,
    isAdmin,
    setIsAdmin,
    authLoading,
    cadastrarCliente,
    loginCliente,
    loginAdmin,
    logout
  };
};
