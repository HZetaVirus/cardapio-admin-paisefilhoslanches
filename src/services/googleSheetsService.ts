
export interface FechamentoDados {
  data: string;
  pedidosConcluidos: number;
  pedidosCancelados: number;
  totalVendas: number;
  totalPedidos: number;
}

export interface RelatorioMensal {
  mes: string;
  ano: number;
  totalVendas: number;
  totalPedidos: number;
  pedidosConcluidos: number;
  pedidosCancelados: number;
  itensVendidos: Array<{
    nome: string;
    quantidade: number;
    valorTotal: number;
  }>;
}

// Configurar as credenciais do Google Sheets
export const configurarGoogleSheets = async (spreadsheetId: string): Promise<boolean> => {
  try {
    console.log('Configurando Google Sheets com ID:', spreadsheetId);
    
    const response = await fetch('/api/google-sheets/configure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ spreadsheetId }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao configurar Google Sheets');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar Google Sheets:', error);
    return false;
  }
};

export const enviarFechamentoParaGoogleSheets = async (dados: FechamentoDados): Promise<boolean> => {
  try {
    console.log('Enviando fechamento para Google Sheets:', dados);
    
    const response = await fetch('/api/google-sheets/fechamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na resposta do servidor:', errorData);
      throw new Error('Erro ao enviar dados para Google Sheets');
    }
    
    const result = await response.json();
    console.log('Dados enviados com sucesso para Google Sheets:', result);
    return true;
  } catch (error) {
    console.error('Erro ao enviar fechamento para Google Sheets:', error);
    return false;
  }
};

export const gerarRelatorioMensal = async (mes: number, ano: number): Promise<RelatorioMensal | null> => {
  try {
    console.log(`Buscando dados para relatório mensal: ${mes}/${ano}`);
    
    const response = await fetch(`/api/google-sheets/relatorio?mes=${mes}&ano=${ano}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do relatório');
    }
    
    const relatorio = await response.json();
    console.log('Relatório gerado:', relatorio);
    return relatorio;
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    return null;
  }
};

export const baixarRelatorioMensal = async (mes: number, ano: number): Promise<void> => {
  try {
    const relatorio = await gerarRelatorioMensal(mes, ano);
    if (!relatorio) {
      throw new Error('Erro ao gerar relatório');
    }
    
    // Converter para CSV
    const csvContent = gerarCSVRelatorio(relatorio);
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${relatorio.mes}_${ano}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    throw error;
  }
};

const gerarCSVRelatorio = (relatorio: RelatorioMensal): string => {
  let csv = 'Relatório Mensal\n\n';
  csv += `Mês,${relatorio.mes} ${relatorio.ano}\n`;
  csv += `Total de Vendas,R$ ${relatorio.totalVendas.toFixed(2)}\n`;
  csv += `Total de Pedidos,${relatorio.totalPedidos}\n`;
  csv += `Pedidos Concluídos,${relatorio.pedidosConcluidos}\n`;
  csv += `Pedidos Cancelados,${relatorio.pedidosCancelados}\n\n`;
  
  csv += 'Itens Mais Vendidos\n';
  csv += 'Nome do Item,Quantidade,Valor Total\n';
  
  relatorio.itensVendidos.forEach(item => {
    csv += `${item.nome},${item.quantidade},R$ ${item.valorTotal.toFixed(2)}\n`;
  });
  
  return csv;
};

// Função para testar a conexão com Google Sheets
export const testarConexaoGoogleSheets = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/google-sheets/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao testar conexão com Google Sheets:', error);
    return false;
  }
};
