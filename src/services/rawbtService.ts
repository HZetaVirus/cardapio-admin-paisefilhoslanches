
// Serviço para integração com impressora térmica via Rawbt
interface RawbtCommand {
  command: string;
  data?: any;
}

class RawbtService {
  private isConnected = false;
  
  // Verificar se o Rawbt está disponível
  checkRawbtAvailability(): boolean {
    try {
      // Tentar abrir URL customizada do Rawbt
      return 'rawbt' in window || this.isAndroidApp();
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do Rawbt:', error);
      return false;
    }
  }
  
  private isAndroidApp(): boolean {
    // Verificar se está rodando em um app Android
    return /Android/i.test(navigator.userAgent) && 
           (window as any).Android !== undefined;
  }
  
  // Enviar comando para o Rawbt
  async sendToRawbt(command: RawbtCommand): Promise<boolean> {
    try {
      if (this.isAndroidApp() && (window as any).Android) {
        // Se estiver em um WebView Android com interface do Rawbt
        (window as any).Android.sendToRawbt(JSON.stringify(command));
        return true;
      } else {
        // Tentar usar URL scheme do Rawbt
        const rawbtUrl = `rawbt://print?data=${encodeURIComponent(JSON.stringify(command))}`;
        window.location.href = rawbtUrl;
        return true;
      }
    } catch (error) {
      console.error('Erro ao enviar para Rawbt:', error);
      return false;
    }
  }
  
  // Formatar pedido para impressão térmica
  formatPedidoParaImpressao(pedido: any, cliente: any): string {
    const data = new Date(pedido.data_pedido).toLocaleString('pt-BR');
    const linha = '================================';
    
    let conteudo = `
${linha}
      NOVO PEDIDO RECEBIDO
${linha}

Pedido #${pedido.id}
Data: ${data}

CLIENTE:
Nome: ${cliente?.nome_completo || 'Cliente não encontrado'}
Tel: ${cliente?.telefone || 'N/A'}
Endereço: ${cliente?.endereco || 'N/A'}

${linha}
ITENS:
${linha}`;

    pedido.itens.forEach((item: any) => {
      conteudo += `\n${item.quantidade}x ${item.nome_item}`;
      conteudo += `\nR$ ${(item.preco * item.quantidade).toFixed(2)}`;
      
      if (item.observacao && item.observacao.trim() !== '') {
        conteudo += `\nOBS: ${item.observacao}`;
      }
      conteudo += '\n';
    });

    conteudo += `\n${linha}`;
    conteudo += `\nTOTAL: R$ ${pedido.valor_total.toFixed(2)}`;
    conteudo += `\nPagamento: ${pedido.forma_pagamento}`;
    
    if (pedido.forma_pagamento === 'dinheiro' && pedido.troco_para) {
      conteudo += `\nTroco para: R$ ${pedido.troco_para.toFixed(2)}`;
    }
    
    if (pedido.observacao) {
      conteudo += `\n\nOBSERVAÇÃO DO PEDIDO:`;
      conteudo += `\n${pedido.observacao}`;
    }
    
    conteudo += `\n\n${linha}`;
    conteudo += '\n\n\n'; // Espaços para corte do papel
    
    return conteudo;
  }
  
  // Imprimir pedido automaticamente
  async imprimirPedidoAutomatico(pedido: any, cliente: any): Promise<boolean> {
    if (!this.checkRawbtAvailability()) {
      console.warn('Rawbt não está disponível para impressão automática');
      return false;
    }
    
    const conteudoImpressao = this.formatPedidoParaImpressao(pedido, cliente);
    
    const command: RawbtCommand = {
      command: 'print',
      data: {
        text: conteudoImpressao,
        charset: 'UTF-8',
        autocut: true,
        drawer: false
      }
    };
    
    console.log('Enviando pedido para impressão automática no Rawbt...');
    return await this.sendToRawbt(command);
  }
  
  // Testar conexão com impressora
  async testarConexao(): Promise<boolean> {
    const command: RawbtCommand = {
      command: 'test',
      data: {
        text: 'Teste de conexão - Impressora funcionando!\n\n\n'
      }
    };
    
    return await this.sendToRawbt(command);
  }
}

export const rawbtService = new RawbtService();
