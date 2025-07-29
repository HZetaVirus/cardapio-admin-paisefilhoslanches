
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { baixarRelatorioMensal } from "@/services/googleSheetsService";
import AdminGoogleSheetsConfig from "./AdminGoogleSheetsConfig";

export default function AdminRelatorioMensal() {
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

  const handleDownloadReport = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Selecione o mês e ano para gerar o relatório");
      return;
    }

    setIsLoading(true);
    try {
      await baixarRelatorioMensal(parseInt(selectedMonth), parseInt(selectedYear));
      toast.success("Relatório baixado com sucesso!");
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast.error("Erro ao gerar relatório. Verifique se o Google Sheets está configurado corretamente.");
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
      await baixarRelatorioMensal(currentMonth, currentYear);
      toast.success("Relatório do mês atual baixado com sucesso!");
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast.error("Erro ao gerar relatório. Verifique se o Google Sheets está configurado corretamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatórios e Google Sheets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="relatorios" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="configuracao">Configurar Google Sheets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="relatorios" className="space-y-6">
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

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sobre os Relatórios</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Os relatórios são gerados a partir dos dados enviados automaticamente para o Google Sheets 
                durante o fechamento do dia. Eles incluem informações detalhadas sobre vendas, pedidos 
                e itens mais vendidos no período selecionado.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="configuracao">
            <AdminGoogleSheetsConfig />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
