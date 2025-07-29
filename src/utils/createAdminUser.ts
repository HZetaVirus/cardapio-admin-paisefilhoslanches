
import { supabase } from '@/integrations/supabase/client';

export const createInitialAdminUser = async (email: string, password: string) => {
  try {
    console.log('Criando usuário administrador...');
    
    const { data, error } = await supabase
      .rpc('create_admin_user', {
        input_email: email,
        input_password: password
      });

    if (error) {
      console.error('Erro ao criar usuário admin:', error);
      return { success: false, error: error.message };
    }

    console.log('Usuário administrador criado com sucesso!', data);
    return { success: true, userId: data };
  } catch (error) {
    console.error('Erro inesperado:', error);
    return { success: false, error: 'Erro inesperado ao criar usuário' };
  }
};

// Função global para usar no console do navegador
(window as any).createAdmin = createInitialAdminUser;
