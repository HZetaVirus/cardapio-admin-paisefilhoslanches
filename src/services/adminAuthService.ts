
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  is_active: boolean;
  last_login?: string;
}

export const adminAuthService = {
  async verifyAdminCredentials(email: string, password: string): Promise<AdminUser | null> {
    try {
      // Input validation
      if (!email?.trim() || !password?.trim()) {
        console.error('Email e senha são obrigatórios');
        return null;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        console.error('Formato de email inválido');
        return null;
      }

      const { data, error } = await supabase
        .rpc('verify_admin_password', {
          input_email: email.trim().toLowerCase(),
          input_password: password
        });

      if (error) {
        console.error('Erro na autenticação do admin:', error);
        return null;
      }

      // Verificar se retornou dados válidos
      if (data && data.length > 0 && data[0].is_valid === true && data[0].user_id) {
        // Atualizar last_login
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data[0].user_id);

        return {
          id: data[0].user_id,
          email: email.trim().toLowerCase(),
          is_active: true,
          last_login: new Date().toISOString()
        };
      }

      console.log('Credenciais inválidas ou usuário inativo');
      return null;
    } catch (error) {
      console.error('Erro inesperado na autenticação do admin:', error);
      return null;
    }
  },

  async createAdminUser(email: string, password: string): Promise<string | null> {
    try {
      // Input validation
      if (!email?.trim() || !password?.trim()) {
        console.error('Email e senha são obrigatórios');
        return null;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        console.error('Formato de email inválido');
        return null;
      }

      // Password strength validation (minimum 8 characters)
      if (password.length < 8) {
        console.error('Senha deve ter pelo menos 8 caracteres');
        return null;
      }

      const { data, error } = await supabase
        .rpc('create_admin_user', {
          input_email: email.trim().toLowerCase(),
          input_password: password
        });

      if (error) {
        console.error('Erro na criação do usuário admin:', error);
        return null;
      }

      console.log('Usuário admin criado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro inesperado na criação do usuário admin:', error);
      return null;
    }
  },

  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, is_active, last_login')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários admin:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários admin:', error);
      return [];
    }
  },

  async updateAdminUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar status do usuário admin:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar status do usuário admin:', error);
      return false;
    }
  }
};
