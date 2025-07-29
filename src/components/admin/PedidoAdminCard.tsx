import { Pedido, StatusPedido } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Printer, X, Bike, Backpack, MessageSquare } from "lucide-react";
import { useRawbtIntegration } from '@/hooks/useRawbtIntegration';

interface PedidoAdminCardProps {
  pedido: Pedido;
  clientes: any[];
  atualizarStatus: (pedidoId: number, novoStatus: StatusPedido) => void;
  imprimirPedido: (pedido: Pedido) => void;
  onShowClienteDetails: (clienteId: number) => void;
}

export default function PedidoAdminCard({ 
  pedido, 
  clientes, 
  atualizarStatus,
  imprimirPedido,
  onShowClienteDetails
}: PedidoAdminCardProps) {
  const { imprimirPedidoManual, rawbtDisponivel } = useRawbtIntegration();
  const cliente = clientes.find(c => c.id === pedido.cliente_id);
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'pedido aceito':
        return <Badge className="bg-blue-500">Pedido aceito</Badge>;
      case 'indo para a chapa agora':
        return <Badge className="bg-yellow-500">Indo para a chapa</Badge>;
      case 'saiu da chapa para sua casa':
        return <Badge className="bg-green-500 flex items-center gap-1">
          <Bike size={14} />
          <Backpack size={14} />
          <span>Saiu da chapa</span>
        </Badge>;
      case 'pedidos cancelados':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'pedidos concluídos':
        return <Badge className="bg-green-700">Concluído</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Verificar se há observações nos itens
  const temObservacoes = pedido.itens.some(item => item.observacao && item.observacao.trim() !== '');
  
  const handleImprimirRawbt = () => {
    imprimirPedidoManual(pedido.id);
  };
  
  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg md:text-2xl flex items-center gap-2">
              Pedido #{pedido.id}
              {temObservacoes && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <MessageSquare size={12} />
                  Observações
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {formatarData(pedido.data_pedido)}
            </CardDescription>
          </div>
          <div 
            className="cursor-pointer" 
            onClick={() => onShowClienteDetails(pedido.cliente_id)}
          >
            {getStatusBadge(pedido.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
        <div 
          className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-md cursor-pointer"
          onClick={() => onShowClienteDetails(pedido.cliente_id)}
        >
          <h4 className="font-semibold text-sm md:text-base mb-2">Dados do Cliente</h4>
          <p className="text-sm md:text-base"><span className="font-medium">Nome:</span> {cliente?.nome_completo || 'Cliente não encontrado'}</p>
          <p className="text-sm md:text-base"><span className="font-medium">Telefone:</span> {cliente?.telefone || 'N/A'}</p>
          <p className="text-sm md:text-base"><span className="font-medium">Endereço:</span> {cliente?.endereco || 'N/A'}</p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="items">
            <AccordionTrigger className="text-sm md:text-base py-2">
              Itens do Pedido
              {temObservacoes && (
                <Badge variant="outline" className="ml-2 flex items-center gap-1 text-xs">
                  <MessageSquare size={12} />
                  Com observações
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm md:text-base">
                {pedido.itens.map((item, index) => (
                  <div key={index} className="py-3 border-b last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.quantidade}x {item.nome_item}
                        </p>
                        {item.observacao && item.observacao.trim() !== '' && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-4 border-blue-500">
                            <div className="flex items-start gap-2">
                              <MessageSquare size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Observação do cliente:</p>
                                <p className="text-sm text-blue-700 dark:text-blue-200 italic">"{item.observacao}"</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="font-medium ml-4">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm md:text-base py-2">Detalhes do Pedido</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <p>Forma de Pagamento:</p>
                  <p className="font-medium">{pedido.forma_pagamento}</p>
                </div>
                
                {pedido.forma_pagamento === 'dinheiro' && pedido.troco_para && (
                  <div className="flex justify-between">
                    <p>Troco para:</p>
                    <p className="font-medium">R$ {pedido.troco_para.toFixed(2)}</p>
                  </div>
                )}
                
                {pedido.observacao && (
                  <div>
                    <p className="font-medium">Observação:</p>
                    <p className="text-gray-600">{pedido.observacao}</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      <CardFooter className="flex-col space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
        <div className="w-full flex justify-between items-center">
          <div className="text-base md:text-lg font-bold">
            Total: R$ {pedido.valor_total.toFixed(2)}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => imprimirPedido(pedido)}
              variant="outline"
              size="sm"
              className="text-xs md:text-sm flex items-center gap-2"
            >
              <Printer size={16} />
              Imprimir
            </Button>
            
            {rawbtDisponivel && (
              <Button 
                onClick={handleImprimirRawbt}
                variant="outline"
                size="sm"
                className="text-xs md:text-sm flex items-center gap-2 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
              >
                <Printer size={16} />
                Rawbt
              </Button>
            )}
          </div>
        </div>
        
        <div className="w-full">
          <h4 className="font-semibold text-sm md:text-base mb-2">Atualizar Status</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {pedido.status === 'pendente' && (
              <>
                <Button 
                  onClick={() => atualizarStatus(pedido.id, 'pedido aceito')}
                  className="bg-blue-500 hover:bg-blue-600 text-xs md:text-sm flex items-center gap-2"
                >
                  <Check size={16} />
                  Aceitar Pedido
                </Button>
                
                <Button 
                  onClick={() => atualizarStatus(pedido.id, 'pedidos cancelados')}
                  variant="destructive"
                  className="text-xs md:text-sm flex items-center gap-2"
                >
                  <X size={16} />
                  Cancelar Pedido
                </Button>
              </>
            )}
            
            {pedido.status === 'pedido aceito' && (
              <Button 
                onClick={() => atualizarStatus(pedido.id, 'indo para a chapa agora')}
                className="bg-yellow-500 hover:bg-yellow-600 text-xs md:text-sm"
              >
                Indo para a Chapa
              </Button>
            )}
            
            {pedido.status === 'indo para a chapa agora' && (
              <Button 
                onClick={() => atualizarStatus(pedido.id, 'saiu da chapa para sua casa')}
                className="bg-green-500 hover:bg-green-600 text-xs md:text-sm flex items-center gap-2"
              >
                <Bike size={16} />
                <Backpack size={16} />
                Saiu da Chapa
              </Button>
            )}
            
            {pedido.status === 'saiu da chapa para sua casa' && (
              <Button 
                onClick={() => atualizarStatus(pedido.id, 'pedidos concluídos')}
                className="bg-green-700 hover:bg-green-800 text-xs md:text-sm"
              >
                Marcar como Concluído
              </Button>
            )}
            
            {(pedido.status === 'pedido aceito' || 
              pedido.status === 'indo para a chapa agora' || 
              pedido.status === 'saiu da chapa para sua casa') && (
              <Button 
                onClick={() => atualizarStatus(pedido.id, 'pedidos cancelados')}
                variant="destructive"
                className="text-xs md:text-sm flex items-center gap-2"
              >
                <X size={16} />
                Cancelar Pedido
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
