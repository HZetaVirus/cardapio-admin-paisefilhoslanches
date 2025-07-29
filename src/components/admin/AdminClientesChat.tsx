
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Phone, MapPin, Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminClientesChat() {
  const { clientes } = useApp();
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);

  const formatarTelefone = (telefone: string) => {
    // Remove caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Formatar para exibição
    if (numeroLimpo.length === 11) {
      return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7)}`;
    } else if (numeroLimpo.length === 10) {
      return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 6)}-${numeroLimpo.slice(6)}`;
    }
    return telefone;
  };

  const abrirWhatsApp = (telefone: string, nomeCliente: string) => {
    // Remove caracteres não numéricos e adiciona código do país se necessário
    let numeroLimpo = telefone.replace(/\D/g, '');
    
    if (numeroLimpo.length === 11 && numeroLimpo.startsWith('11')) {
      numeroLimpo = '55' + numeroLimpo;
    } else if (numeroLimpo.length === 10) {
      numeroLimpo = '5511' + numeroLimpo;
    } else if (numeroLimpo.length === 11 && !numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }
    
    const mensagem = encodeURIComponent(`Olá ${nomeCliente}, tudo bem? Sou do restaurante e gostaria de falar com você!`);
    const urlWhatsApp = `https://wa.me/${numeroLimpo}?text=${mensagem}`;
    
    window.open(urlWhatsApp, '_blank');
  };

  const formatarData = (dataString: string | null) => {
    if (!dataString) return 'Nenhum pedido';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clienteDetalhes = clienteSelecionado ? clientes.find(c => c.id === clienteSelecionado) : null;

  return (
    <div className="w-full">
      {/* Layout responsivo */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <div className="lg:col-span-1 order-1">
          <Card className="bg-white dark:bg-gray-900 shadow-lg">
            <CardHeader className="p-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Clientes ({clientes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4 pt-3">
                  {clientes
                    .sort((a, b) => {
                      // Ordenar por data do último pedido (mais recente primeiro)
                      if (!a.data_ultimo_pedido && !b.data_ultimo_pedido) return 0;
                      if (!a.data_ultimo_pedido) return 1;
                      if (!b.data_ultimo_pedido) return -1;
                      return new Date(b.data_ultimo_pedido).getTime() - new Date(a.data_ultimo_pedido).getTime();
                    })
                    .map((cliente) => (
                    <div
                      key={cliente.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                        clienteSelecionado === cliente.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setClienteSelecionado(cliente.id)}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {cliente.nome_completo}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {formatarTelefone(cliente.telefone)}
                        </p>
                        {cliente.data_ultimo_pedido && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {formatarData(cliente.data_ultimo_pedido).split(' ')[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Cliente */}
        <div className="lg:col-span-2 order-2">
          <Card className="bg-white dark:bg-gray-900 shadow-lg">
            {clienteDetalhes ? (
              <>
                <CardHeader className="p-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informações de {clienteDetalhes.nome_completo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-gray-50 dark:bg-gray-800">
                  <div className="space-y-4">
                    {/* Telefone */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {formatarTelefone(clienteDetalhes.telefone)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Último Pedido */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Último Pedido</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {formatarData(clienteDetalhes.data_ultimo_pedido)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white break-words">
                            {clienteDetalhes.endereco}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão do WhatsApp */}
                    <div className="pt-4">
                      <Button
                        onClick={() => abrirWhatsApp(clienteDetalhes.telefone, clienteDetalhes.nome_completo)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium flex items-center justify-center gap-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                        size="lg"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Abrir WhatsApp
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center text-gray-500 dark:text-gray-400 py-20">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg font-medium mb-2">Selecione um cliente</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Escolha um cliente da lista para ver as informações completas
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
