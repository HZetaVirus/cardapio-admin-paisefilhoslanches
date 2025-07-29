
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarIcon, TrendingUpIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { arquivarPedidosFinalizados } from "@/services/pedidoArchiveService";
import { enviarFechamentoParaGoogleSheets } from "@/services/googleSheetsService";
import { toast } from "sonner";

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

  const handleFecharDia = async () => {
    setIsLoading(true);
    try {
      const totals = calculateTotals();
      
      // Primeiro, enviar dados para Google Sheets
      const dadosFechamento = {
        data: new Date().toISOString().split('T')[0],
        pedidosConcluidos: totals.pedidosConcluidos,
        pedidosCancelados: totals.pedidosCancelados,
        totalVendas: totals.totalVendas,
        totalPedidos: totals.totalPedidos
      };

      console.log('Enviando fechamento para Google Sheets...');
      const envioSucesso = await enviarFechamentoParaGoogleSheets(dadosFechamento);
      
      if (!envioSucesso) {
        console.warn('Falha ao enviar para Google Sheets, mas continuando com o arquivamento...');
        toast.error("Aviso: Dados não foram enviados para a planilha, mas o fechamento continuará.");
      }

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
        
        if (envioSucesso) {
          toast.success("Dia fechado com sucesso! Dados enviados para a planilha e pedidos arquivados.");
        } else {
          toast.success("Dia fechado com sucesso! Pedidos arquivados (verifique a configuração da planilha).");
        }
        
        console.log(`${pedidosArquivados.length} pedidos foram arquivados e removidos da visualização`);
      } else {
        toast.error("Erro ao fechar o dia. Tente novamente.");
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
                {isLoading ? "Fechando..." : "Fechar Dia"}
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
                  <strong>Os dados serão enviados automaticamente para a planilha do Google Sheets</strong> e os pedidos serão removidos da visualização diária, mas permanecerão disponíveis para relatórios mensais.
                  <br />
                  <br />
                  Esta ação permitirá que você comece um novo dia limpo, sem os pedidos do dia anterior.
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

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Integração Google Sheets:</strong> Os dados do fechamento serão enviados automaticamente 
            para sua planilha configurada. Certifique-se de que as credenciais estão configuradas corretamente 
            nas configurações do sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
