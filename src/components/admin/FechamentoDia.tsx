
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarIcon, TrendingUpIcon, DownloadIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { arquivarPedidosFinalizados } from "@/services/pedidoArchiveService";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export default function FechamentoDia() {
  const { pedidos, setPedidos } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const getPedidosParaArquivar = () => {
    return pedidos.filter(pedido => 
      (pedido.status === 'pedidos concluídos' || pedido.status === 'pedidos cancelados') &&
      (!pedido.observacao || !pedido.observacao.includes('ARQUIVADO_'))
    );
  };

  const calculateTotals = () => {
    const pedidosParaArquivar = getPedidosParaArquivar();
    const concluidos = pedidosParaArquivar.filter(p => p.status === 'pedidos concluídos');
    const cancelados = pedidosParaArquivar.filter(p => p.status === 'pedidos cancelados');
    
    const totalVendas = concluidos.reduce((sum, pedido) => sum + Number(pedido.valor_total), 0);
    
    return {
      totalPedidos: pedidosParaArquivar.length,
      pedidosConcluidos: concluidos.length,
      pedidosCancelados: cancelados.length,
      totalVendas
    };
  };

  const gerarExcelFechamento = () => {
    const pedidosParaArquivar = getPedidosParaArquivar();
    const { pedidosConcluidos, pedidosCancelados, totalVendas } = calculateTotals();
    
    // Preparar dados dos pedidos
    const dadosPedidos = pedidosParaArquivar.map(pedido => ({
      'ID': pedido.id,
      'Status': pedido.status,
      'Valor': `R$ ${Number(pedido.valor_total).toFixed(2)}`,
      'Cliente': pedido.cliente || 'N/A',
      'Data': new Date(pedido.created_at).toLocaleDateString('pt-BR'),
      'Hora': new Date(pedido.created_at).toLocaleTimeString('pt-BR'),
      'Observações': pedido.observacao || ''
    }));

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    
    // Criar worksheet dos pedidos
    const worksheetPedidos = XLSX.utils.json_to_sheet(dadosPedidos);
    XLSX.utils.book_append_sheet(workbook, worksheetPedidos, 'Pedidos');

    // Criar worksheet do resumo
    const hoje = new Date().toLocaleDateString('pt-BR');
    const resumoData = [
      ['RESUMO DO FECHAMENTO'],
      [''],
      ['Data:', hoje],
      ['Hora:', new Date().toLocaleTimeString('pt-BR')],
      [''],
      ['ESTATÍSTICAS'],
      ['Pedidos Concluídos:', pedidosConcluidos],
      ['Pedidos Cancelados:', pedidosCancelados],
      ['Total de Pedidos:', pedidosParaArquivar.length],
      ['Total de Vendas:', `R$ ${totalVendas.toFixed(2)}`],
    ];

    const worksheetResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo');

    // Gerar e baixar arquivo
    const nomeArquivo = `fechamento-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
    
    return nomeArquivo;
  };

  const handleFecharDia = async () => {
    setIsLoading(true);
    try {
      // Gerar e baixar Excel
      const nomeArquivo = gerarExcelFechamento();
      
      // Arquivar pedidos no banco
      const success = await arquivarPedidosFinalizados();
      
      if (success) {
        // Remover pedidos arquivados da lista atual
        const pedidosArquivados = getPedidosParaArquivar();
        const idsArquivados = pedidosArquivados.map(p => p.id);
        
        // Filtrar pedidos para manter apenas os não arquivados
        const pedidosRestantes = pedidos.filter(pedido => 
          !idsArquivados.includes(pedido.id)
        );
        
        setPedidos(pedidosRestantes);
        
        toast.success(`Fechamento realizado com sucesso! Arquivo ${nomeArquivo} baixado e pedidos arquivados.`);
        console.log(`${pedidosArquivados.length} pedidos foram arquivados e removidos da visualização`);
      } else {
        toast.error("Erro ao arquivar pedidos. Tente novamente.");
      }
    } catch (error) {
      console.error('Erro ao fechar dia:', error);
      toast.error("Erro ao fechar o dia. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const { totalPedidos, pedidosConcluidos, pedidosCancelados, totalVendas } = calculateTotals();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Fechamento do Dia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {pedidosConcluidos}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pedidos Concluídos
            </div>
          </div>
          
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {pedidosCancelados}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pedidos Cancelados
            </div>
          </div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUpIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              Total de Vendas
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            R$ {totalVendas.toFixed(2)}
          </div>
        </div>

        {totalPedidos > 0 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Processando..."
                ) : (
                  <>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Fechar Dia
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Fechamento do Dia</AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a arquivar {totalPedidos} pedido(s) finalizados:
                  <br />
                  • {pedidosConcluidos} concluído(s)
                  <br />
                  • {pedidosCancelados} cancelado(s)
                  <br />
                  <br />
                  Total de vendas: <strong>R$ {totalVendas.toFixed(2)}</strong>
                  <br />
                  <br />
                  <strong>O que acontecerá:</strong>
                  <br />
                  • 📥 Arquivo Excel será baixado automaticamente
                  <br />
                  • 📦 Pedidos serão arquivados no banco de dados
                  <br />
                  • 🧹 Lista será limpa para o próximo dia
                  <br />
                  <br />
                  Os pedidos permanecerão disponíveis para relatórios mensais.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleFecharDia} disabled={isLoading}>
                  {isLoading ? "Fechando..." : "Confirmar Fechamento"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Não há pedidos concluídos ou cancelados para arquivar hoje.
          </div>
        )}

        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Download Excel:</strong> Ao fechar o dia, um arquivo Excel será gerado 
            automaticamente com todos os pedidos e um resumo das vendas. Os pedidos serão 
            arquivados mas permanecerão disponíveis para consultas futuras.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
