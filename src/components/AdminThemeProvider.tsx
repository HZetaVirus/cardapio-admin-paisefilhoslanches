import React, { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
}

const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const { theme } = useTheme();

  useEffect(() => {
    // Força o tema padrão na primeira carga se não houver preferência salva
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      localStorage.setItem('theme', defaultTheme);
      if (defaultTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, [defaultTheme]);

  // Adiciona classes específicas para o painel admin
  useEffect(() => {
    const body = document.body;
    body.classList.add('admin-panel');
    
    if (theme === 'light') {
      body.classList.add('admin-light');
      body.classList.remove('admin-dark');
    } else {
      body.classList.add('admin-dark');
      body.classList.remove('admin-light');
    }

    return () => {
      body.classList.remove('admin-panel', 'admin-light', 'admin-dark');
    };
  }, [theme]);

  return <>{children}</>;
};

export default AdminThemeProvider;