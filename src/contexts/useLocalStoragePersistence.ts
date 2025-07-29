
import { useEffect } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useCart } from '@/hooks/useCart';

export const useLocalStoragePersistence = (
  auth: ReturnType<typeof useSecureAuth>,
  cart: ReturnType<typeof useCart>
) => {
  // Salvar dados de cliente no localStorage quando mudarem
  useEffect(() => {
    if (auth.clienteAtual) {
      console.log('Salvando cliente no localStorage:', auth.clienteAtual);
      localStorage.setItem('clienteAtual', JSON.stringify(auth.clienteAtual));
    } else {
      localStorage.removeItem('clienteAtual');
    }
  }, [auth.clienteAtual]);
  
  // Admin session is now handled securely in sessionStorage by useSecureAuth
  
  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    if (cart.carrinhoAtual.length > 0) {
      localStorage.setItem('carrinhoAtual', JSON.stringify(cart.carrinhoAtual));
    } else {
      localStorage.removeItem('carrinhoAtual');
    }
  }, [cart.carrinhoAtual]);
};
