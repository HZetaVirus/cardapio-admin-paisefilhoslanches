
import { Pedido, Cliente } from "@/types";

export class PrintService {
  static imprimirPedido(pedido: Pedido, cliente: Cliente | undefined): void {
    const htmlContent = this.gerarHTMLPedido(pedido, cliente);
    
    // Criar uma janela temporária para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Bloqueador de pop-ups pode estar impedindo a impressão. Por favor, permita pop-ups para este site.');
      return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar o carregamento e imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }
  
  private static gerarHTMLPedido(pedido: Pedido, cliente: Cliente | undefined): string {
    const dataFormatada = new Date(pedido.data_pedido).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const itensHTML = pedido.itens.map(item => `
      <tr>
        <td style="padding: 8px 4px; border-bottom: 1px solid #ddd;">
          ${item.quantidade}x ${item.nome_item}
        </td>
        <td style="padding: 8px 4px; border-bottom: 1px solid #ddd; text-align: right;">
          R$ ${(item.preco * item.quantidade).toFixed(2)}
        </td>
      </tr>
      ${item.observacao ? `
        <tr>
          <td colspan="2" style="padding: 4px 8px; font-size: 12px; color: #666; font-style: italic;">
            Obs: ${item.observacao}
          </td>
        </tr>
      ` : ''}
    `).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${pedido.id}</title>
        <style>
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
            }
            
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              margin: 0;
              padding: 0;
            }
            
            .no-print {
              display: none !important;
            }
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            margin: 20px;
            background: white;
          }
          
          .receipt {
            max-width: 300px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
          }
          
          .pedido-info {
            margin: 15px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          
          .cliente-info {
            margin: 15px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          
          .itens-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          
          .total {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            padding: 10px;
            border: 2px solid #000;
          }
          
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            color: #666;
          }
          
          .print-button {
            text-align: center;
            margin: 20px 0;
          }
          
          button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          
          button:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>COMANDA DE PEDIDO</h1>
          </div>
          
          <div class="pedido-info">
            <strong>Pedido #${pedido.id}</strong><br>
            <strong>Data:</strong> ${dataFormatada}<br>
            <strong>Status:</strong> ${pedido.status}
          </div>
          
          <div class="cliente-info">
            <strong>DADOS DO CLIENTE</strong><br>
            <strong>Nome:</strong> ${cliente?.nome_completo || 'Cliente não encontrado'}<br>
            <strong>Telefone:</strong> ${cliente?.telefone || 'N/A'}<br>
            <strong>Endereço:</strong> ${cliente?.endereco || 'N/A'}
          </div>
          
          <div>
            <strong>ITENS DO PEDIDO</strong>
            <table class="itens-table">
              ${itensHTML}
            </table>
          </div>
          
          <div style="margin: 15px 0; border-top: 1px solid #ddd; padding-top: 10px;">
            <strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento}<br>
            ${pedido.forma_pagamento === 'dinheiro' && pedido.troco_para ? 
              `<strong>Troco para:</strong> R$ ${pedido.troco_para.toFixed(2)}<br>` : ''}
            ${pedido.observacao ? `<strong>Observação:</strong> ${pedido.observacao}<br>` : ''}
          </div>
          
          <div class="total">
            TOTAL: R$ ${pedido.valor_total.toFixed(2)}
          </div>
          
          <div class="footer">
            Obrigado pela preferência!<br>
            Impressão: ${new Date().toLocaleString('pt-BR')}
          </div>
          
          <div class="print-button no-print">
            <button onclick="window.print()">🖨️ Imprimir</button>
            <button onclick="window.close()" style="background: #6c757d; margin-left: 10px;">❌ Fechar</button>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
