
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { getPedidosArquivadosRelatorio } from "@/services/supabaseService";

export function useChartsData() {
  const { pedidos } = useApp();
  const [pedidosArquivados, setPedidosArquivados] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchPedidosArquivados = async () => {
      // Buscar pedidos arquivados dos últimos 30 dias
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 30);
      
      const arquivados = await getPedidosArquivadosRelatorio(dataInicio.toISOString());
      setPedidosArquivados(arquivados);
    };
    
    fetchPedidosArquivados();
  }, []);
  
  // Combinar pedidos ativos e arquivados para cálculos
  const todosPedidos = [
    ...pedidos,
    ...pedidosArquivados.map(p => ({
      ...p,
      valor_total: Number(p.valor_total),
      data_pedido: p.data_pedido
    }))
  ];
  
  // Calcular valor total e valor cancelado
  const valoresCompletos = todosPedidos
    .filter(p => p.status === 'pedidos concluídos')
    .reduce((total, pedido) => total + pedido.valor_total, 0);
    
  const valoresCancelados = todosPedidos
    .filter(p => p.status === 'pedidos cancelados')
    .reduce((total, pedido) => total + pedido.valor_total, 0);
  
  const valorTotal = valoresCompletos + valoresCancelados;
  
  // Filtrar apenas pedidos concluídos para receita
  const pedidosConcluidos = todosPedidos.filter(p => p.status === 'pedidos concluídos');
  
  // Dados para o gráfico de barras por dia da semana
  const ultimosSeterias = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  
  const dadosPorDia = ultimosSeterias.map(data => {
    const pedidosDoDia = pedidosConcluidos.filter(p => {
      const dataPedido = new Date(p.data_pedido);
      return (
        dataPedido.getDate() === data.getDate() && 
        dataPedido.getMonth() === data.getMonth() && 
        dataPedido.getFullYear() === data.getFullYear()
      );
    });
    
    const valorConcluidos = pedidosDoDia
      .filter(p => p.status === 'pedidos concluídos')
      .reduce((total, pedido) => total + pedido.valor_total, 0);
      
    const valorCancelados = pedidosDoDia
      .filter(p => p.status === 'pedidos cancelados')
      .reduce((total, pedido) => total + pedido.valor_total, 0);
      
    return {
      dia: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
      concluídos: valorConcluidos,
      cancelados: valorCancelados
    };
  });
  
  // Dados para o gráfico de pizza com cores PowerBI
  const dadosPizza = [
    { name: 'Faturamento', value: valoresCompletos, color: 'hsl(168, 76%, 42%)' },
    { name: 'Perda', value: valoresCancelados, color: 'hsl(0, 84%, 60%)' }
  ];
  
  // Dados para pedidos por status com labels mais curtos
  const dadosPorStatus = [
    { name: 'Pendentes', quantidade: pedidos.filter(p => p.status === 'pendente').length },
    { name: 'Aceitos', quantidade: pedidos.filter(p => p.status === 'pedido aceito').length },
    { name: 'Na Chapa', quantidade: pedidos.filter(p => p.status === 'indo para a chapa agora').length },
    { name: 'Em Entrega', quantidade: pedidos.filter(p => p.status === 'saiu da chapa para sua casa').length },
    { name: 'Concluídos', quantidade: pedidos.filter(p => p.status === 'pedidos concluídos').length },
    { name: 'Cancelados', quantidade: pedidos.filter(p => p.status === 'pedidos cancelados').length },
  ];

  return {
    valoresCompletos,
    valoresCancelados,
    valorTotal,
    dadosPorDia,
    dadosPizza,
    dadosPorStatus
  };
}
