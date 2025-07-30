
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import * as XLSX from 'xlsx';

export default function AdminRelatorioMensal() {
  const { pedidos } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const gerarRelatorioExcel = (mes: number, ano: number) => {
    // Filtrar pedidos do mês/ano selecionado
    const pedidosDoMes = pedidos.filter(pedido => {
      const dataPedido = new Date(pedido.created_at);
      return dataPedido.getMonth() + 1 === mes && dataPedido.getFullYear() === ano;
    });

    if (pedidosDoMes.length === 0) {
      toast.error("Nenhum pedido encontrado para o período selecionado");
      return;
    }

    // Preparar dados para o Excel
    const dadosRelatorio = pedidosDoMes.map(pedido => ({
      'ID': pedido.id,
      'Data': new Date(pedido.created_at).toLocaleDateString('pt-BR'),
      'Hora': new Date(pedido.created_at).toLocaleTimeString('pt-BR'),
      'Cliente': pedido.cliente || 'N/A',
      'Status': pedido.status,
      'Valor Total': `R$ ${Number(pedido.valor_total).toFixed(2)}`,
      'Observações': pedido.observacao || ''
    }));

    // Calcular estatísticas
    const totalPedidos = pedidosDoMes.length;
    const pedidosConcluidos = pedidosDoMes.filter(p => p.status === 'pedidos concluídos').length;
    const pedidosCancelados = pedidosDoMes.filter(p => p.status === 'pedidos cancelados').length;
    const totalVendas = pedidosDoMes
      .filter(p => p.status === 'pedidos concluídos')
      .reduce((sum, p) => sum + Number(p.valor_total), 0);

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    
    // Aba de pedidos
    const worksheetPedidos = XLSX.utils.json_to_sheet(dadosRelatorio);
    XLSX.utils.book_append_sheet(workbook, worksheetPedidos, 'Pedidos');

    // Aba de resumo
    const resumoData = [
      [`RELATÓRIO MENSAL - ${months.find(m => m.value === mes.toString())?.label} ${ano}`],
      [''],
      ['PERÍODO:', `${months.find(m => m.value === mes.toString())?.label} de ${ano}`],
      ['DATA DE GERAÇÃO:', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['ESTATÍSTICAS GERAIS'],
      ['Total de Pedidos:', totalPedidos],
      ['Pedidos Concluídos:', pedidosConcluidos],
      ['Pedidos Cancelados:', pedidosCancelados],
      ['Total de Vendas:', `R$ ${totalVendas.toFixed(2)}`],
      [''],
      ['RESUMO POR STATUS'],
      ['Status', 'Quantidade', 'Percentual'],
      ['Concluídos', pedidosConcluidos, `${((pedidosConcluidos / totalPedidos) * 100).toFixed(1)}%`],
      ['Cancelados', pedidosCancelados, `${((pedidosCancelados / totalPedidos) * 100).toFixed(1)}%`]
    ];

    const worksheetResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo');

    // Gerar e baixar arquivo
    const nomeArquivo = `relatorio-${months.find(m => m.value === mes.toString())?.label.toLowerCase()}-${ano}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
    
    return nomeArquivo;
  };

  const handleDownloadReport = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Selecione o mês e ano para gerar o relatório");
      return;
    }

    setIsLoading(true);
    try {
      const nomeArquivo = gerarRelatorioExcel(parseInt(selectedMonth), parseInt(selectedYear));
      if (nomeArquivo) {
        toast.success(`Relatório ${nomeArquivo} baixado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error("Erro ao gerar relatório.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCurrentMonth = async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    setIsLoading(true);
    try {
      const nomeArquivo = gerarRelatorioExcel(currentMonth, currentYear);
      if (nomeArquivo) {
        toast.success(`Relatório ${nomeArquivo} baixado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error("Erro ao gerar relatório.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatórios Mensais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Baixar Relatório do Mês Atual</h3>
          <Button 
            onClick={handleDownloadCurrentMonth}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? "Gerando..." : "Baixar Relatório Atual"}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Baixar Relatório de Período Específico</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleDownloadReport}
            disabled={isLoading || !selectedMonth || !selectedYear}
            className="w-full md:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? "Gerando..." : "Baixar Relatório"}
          </Button>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Sobre os Relatórios</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Os relatórios são gerados localmente a partir dos pedidos armazenados no sistema. 
            Eles incluem informações detalhadas sobre vendas, pedidos e estatísticas do período selecionado.
            Os arquivos são baixados em formato Excel (.xlsx).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
