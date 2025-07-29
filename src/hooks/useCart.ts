
import { useState } from 'react';
import { ItemPedido, ItemCardapio, Adicional } from '@/types';

export const useCart = () => {
  const [carrinhoAtual, setCarrinhoAtual] = useState<ItemPedido[]>([]);

  const adicionarAoCarrinho = (item: ItemCardapio, quantidade: number, observacao?: string, adicionais?: Adicional[]) => {
    const precoAdicionais = adicionais?.reduce((total, adicional) => total + adicional.preco, 0) || 0;
    const precoTotal = item.preco + precoAdicionais;
    
    const itemExistente = carrinhoAtual.find(i => 
      i.item_id === item.id && 
      JSON.stringify(i.adicionais) === JSON.stringify(adicionais)
    );
    
    if (itemExistente) {
      setCarrinhoAtual(carrinhoAtual.map(i => 
        i.item_id === item.id && JSON.stringify(i.adicionais) === JSON.stringify(adicionais)
          ? { ...i, quantidade: i.quantidade + quantidade, observacao: observacao || i.observacao } 
          : i
      ));
    } else {
      setCarrinhoAtual([...carrinhoAtual, {
        item_id: item.id,
        quantidade,
        observacao,
        nome_item: item.nome_item,
        preco: precoTotal,
        adicionais
      }]);
    }
  };

  const removerDoCarrinho = (itemId: number) => {
    setCarrinhoAtual(carrinhoAtual.filter(i => i.item_id !== itemId));
  };

  const atualizarQuantidadeCarrinho = (itemId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerDoCarrinho(itemId);
      return;
    }
    
    setCarrinhoAtual(carrinhoAtual.map(i => 
      i.item_id === itemId ? { ...i, quantidade } : i
    ));
  };

  const limparCarrinho = () => {
    setCarrinhoAtual([]);
  };

  return {
    carrinhoAtual,
    setCarrinhoAtual,
    adicionarAoCarrinho,
    removerDoCarrinho,
    atualizarQuantidadeCarrinho,
    limparCarrinho
  };
};
