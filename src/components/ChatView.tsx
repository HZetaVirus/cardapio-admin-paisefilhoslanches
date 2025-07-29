
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

export default function ChatView() {
  const { clienteAtual, isAdmin, clientes } = useApp();
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
  }, [clienteSelecionado, clienteAtual]);

  const carregarMensagens = () => {
    // Simulação de mensagens - em produção seria uma chamada para API
    const mensagensSimuladas: Mensagem[] = [
      {
        id: 1,
        cliente_id: clienteAtual?.id || 1,
        mensagem: "Olá! Gostaria de saber sobre o cardápio.",
        data_envio: new Date().toISOString(),
        tipo: 'cliente',
        cliente_nome: clienteAtual?.nome_completo || "Cliente"
      },
      {
        id: 2,
        cliente_id: clienteAtual?.id || 1,
        admin_id: 1,
        mensagem: "Olá! Claro, posso te ajudar com qualquer dúvida sobre nossos pratos.",
        data_envio: new Date().toISOString(),
        tipo: 'admin'
      }
    ];

    if (isAdmin && clienteSelecionado) {
      setMensagens(mensagensSimuladas.filter(m => m.cliente_id === clienteSelecionado));
    } else if (clienteAtual) {
      setMensagens(mensagensSimuladas.filter(m => m.cliente_id === clienteAtual.id));
    }
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    if (!isAdmin && !clienteAtual) {
      toast.error("Você precisa estar logado para enviar mensagens");
      return;
    }

    if (isAdmin && !clienteSelecionado) {
      toast.error("Selecione um cliente para conversar");
      return;
    }

    setIsLoading(true);

    const novaMensagemObj: Mensagem = {
      id: Date.now(),
      cliente_id: isAdmin ? clienteSelecionado! : clienteAtual!.id,
      mensagem: novaMensagem,
      data_envio: new Date().toISOString(),
      tipo: isAdmin ? 'admin' : 'cliente',
      cliente_nome: isAdmin ? clientes.find(c => c.id === clienteSelecionado)?.nome_completo : clienteAtual?.nome_completo
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

  if (isAdmin) {
    return (
      <div className="container mx-auto py-4 px-2 md:py-6 md:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
          {/* Lista de Clientes */}
          <Card className="lg:col-span-1">
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] lg:h-[500px]">
                <div className="space-y-1 p-3 md:p-4 pt-0">
                  {clientes.map((cliente) => (
                    <Button
                      key={cliente.id}
                      variant={clienteSelecionado === cliente.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-2 md:p-3"
                      onClick={() => setClienteSelecionado(cliente.id)}
                    >
                      <div>
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

          {/* Área de Chat */}
          <Card className="lg:col-span-3">
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-sm md:text-base">
                {clienteSelecionado 
                  ? `Chat com ${clientes.find(c => c.id === clienteSelecionado)?.nome_completo}`
                  : "Selecione um cliente para conversar"
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              {clienteSelecionado ? (
                <div className="flex flex-col h-[400px] lg:h-[500px]">
                  <ScrollArea className="flex-1 mb-4 border rounded-lg p-3">
                    <div className="space-y-3">
                      {mensagens.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.tipo === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] md:max-w-[70%] p-2 md:p-3 rounded-lg text-xs md:text-sm ${
                              msg.tipo === 'admin'
                                ? 'bg-restaurant-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                          >
                            <p>{msg.mensagem}</p>
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

                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={enviarMensagem}
                      disabled={isLoading}
                      size="sm"
                      className="bg-restaurant-primary hover:bg-restaurant-primary/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] lg:h-[500px] flex items-center justify-center text-gray-500">
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
    );
  }

  // Interface do Cliente
  return (
    <div className="container mx-auto py-4 px-2 md:py-6 md:px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat com o Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="flex flex-col h-[500px] md:h-[600px]">
            <ScrollArea className="flex-1 mb-4 border rounded-lg p-3">
              <div className="space-y-3">
                {mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.tipo === 'cliente' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] p-2 md:p-3 rounded-lg text-sm ${
                        msg.tipo === 'cliente'
                          ? 'bg-restaurant-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <p>{msg.mensagem}</p>
                      <p className={`text-xs mt-1 ${
                        msg.tipo === 'cliente' ? 'text-white/70' : 'text-gray-500'
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

            <div className="flex flex-col sm:flex-row gap-2">
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
                className="bg-restaurant-primary hover:bg-restaurant-primary/90 w-full sm:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
