
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Mensagem {
  id: number;
  cliente_id: number;
  admin_id?: number;
  mensagem: string;
  data_envio: string;
  tipo: 'cliente' | 'admin';
  cliente_nome?: string;
}

export default function AdminChatView() {
  const { clientes } = useApp();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  useEffect(() => {
    carregarMensagens();
  }, [clienteSelecionado]);

  const carregarMensagens = () => {
    const mensagensSimuladas: Mensagem[] = [
      {
        id: 1,
        cliente_id: clienteSelecionado || 1,
        mensagem: "Olá! Gostaria de saber sobre o cardápio.",
        data_envio: new Date().toISOString(),
        tipo: 'cliente',
        cliente_nome: clientes.find(c => c.id === clienteSelecionado)?.nome_completo || "Cliente"
      },
      {
        id: 2,
        cliente_id: clienteSelecionado || 1,
        admin_id: 1,
        mensagem: "Olá! Claro, posso te ajudar com qualquer dúvida sobre nossos pratos.",
        data_envio: new Date().toISOString(),
        tipo: 'admin'
      }
    ];

    if (clienteSelecionado) {
      setMensagens(mensagensSimuladas.filter(m => m.cliente_id === clienteSelecionado));
    }
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    if (!clienteSelecionado) {
      toast.error("Selecione um cliente para conversar");
      return;
    }

    setIsLoading(true);

    const novaMensagemObj: Mensagem = {
      id: Date.now(),
      cliente_id: clienteSelecionado,
      mensagem: novaMensagem,
      data_envio: new Date().toISOString(),
      tipo: 'admin',
      cliente_nome: clientes.find(c => c.id === clienteSelecionado)?.nome_completo
    };

    setMensagens(prev => [...prev, novaMensagemObj]);
    setNovaMensagem("");
    setIsLoading(false);
    toast.success("Mensagem enviada!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className="w-full h-full">
      {/* Layout responsivo para mobile e desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 h-[calc(100vh-280px)] md:h-[calc(100vh-240px)] lg:h-[calc(100vh-200px)]">
        {/* Lista de Clientes */}
        <div className="lg:col-span-1 order-1">
          <Card className="h-full">
            <CardHeader className="p-3 md:p-4 pb-2">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-4rem)]">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-3 md:p-4 pt-0">
                  {clientes.map((cliente) => (
                    <Button
                      key={cliente.id}
                      variant={clienteSelecionado === cliente.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-2 md:p-3"
                      onClick={() => setClienteSelecionado(cliente.id)}
                    >
                      <div className="w-full">
                        <p className="font-medium text-xs md:text-sm truncate">
                          {cliente.nome_completo}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {cliente.telefone}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Área de Chat */}
        <div className="lg:col-span-3 order-2 flex-1 min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="p-3 md:p-4 pb-2 flex-shrink-0">
              <CardTitle className="text-sm md:text-base">
                {clienteSelecionado 
                  ? `Chat com ${clientes.find(c => c.id === clienteSelecionado)?.nome_completo}`
                  : "Selecione um cliente para conversar"
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 flex-1 flex flex-col min-h-0">
              {clienteSelecionado ? (
                <div className="flex flex-col h-full">
                  {/* Área de mensagens */}
                  <div className="flex-1 mb-4 border rounded-lg overflow-hidden">
                    <ScrollArea className="h-full p-3">
                      <div className="space-y-3">
                        {mensagens.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.tipo === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] p-2 md:p-3 rounded-lg text-xs md:text-sm ${
                                msg.tipo === 'admin'
                                  ? 'bg-restaurant-primary text-white'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                            >
                              <p className="break-words">{msg.mensagem}</p>
                              <p className={`text-xs mt-1 ${
                                msg.tipo === 'admin' ? 'text-white/70' : 'text-gray-500'
                              }`}>
                                {new Date(msg.data_envio).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Input de mensagem - fixo na parte inferior */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-sm flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={enviarMensagem}
                      disabled={isLoading}
                      size="sm"
                      className="bg-restaurant-primary hover:bg-restaurant-primary/90 flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm md:text-base">Selecione um cliente para iniciar uma conversa</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
