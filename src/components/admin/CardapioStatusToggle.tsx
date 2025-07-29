
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Store, Power, Clock, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useSmartCardapioControl } from "@/hooks/useSmartCardapioControl";
import { isStoreOpen } from "@/utils/storeHours";
import { useState } from "react";
import type { ModoOperacao } from "@/types";

export default function CardapioStatusToggle() {
  const { configuracaoLoja } = useApp();
  const {
    cardapioStatus,
    modoOperacao,
    isChecking,
    setModoOperacao,
    toggleFeriado,
    isFeriado,
    feriadosFechamento
  } = useSmartCardapioControl();
  
  const [novaDataFeriado, setNovaDataFeriado] = useState("");

  const handleModoChange = async (novoModo: ModoOperacao) => {
    if (!configuracaoLoja) return;

    try {
      if (novoModo === 'manual') {
        // No modo manual, mantém o status atual
        await setModoOperacao(novoModo, configuracaoLoja.cardapioAtivo);
      } else {
        // Nos outros modos, não especifica status manual
        await setModoOperacao(novoModo);
      }
      
      toast.success(
        `Modo alterado para ${
          novoModo === 'automatico' ? 'Automático' :
          novoModo === 'manual' ? 'Manual' : 'Fechado Forçado'
        }`
      );
    } catch (error) {
      console.error('Erro ao alterar modo de operação:', error);
      toast.error("Erro ao alterar modo de operação");
    }
  };

  const handleManualToggle = async (checked: boolean) => {
    if (modoOperacao !== 'manual') return;

    try {
      await setModoOperacao('manual', checked);
      toast.success(
        checked 
          ? "Cardápio ativado manualmente!" 
          : "Cardápio desativado manualmente!"
      );
    } catch (error) {
      console.error('Erro ao alterar status manual:', error);
      toast.error("Erro ao alterar status manual");
    }
  };

  const handleAdicionarFeriado = async () => {
    if (!novaDataFeriado) return;

    try {
      await toggleFeriado(novaDataFeriado);
      setNovaDataFeriado("");
      toast.success("Feriado adicionado com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar feriado:', error);
      toast.error("Erro ao adicionar feriado");
    }
  };

  const handleRemoverFeriado = async (data: string) => {
    try {
      await toggleFeriado(data);
      toast.success("Feriado removido com sucesso!");
    } catch (error) {
      console.error('Erro ao remover feriado:', error);
      toast.error("Erro ao remover feriado");
    }
  };

  const getStatusInfo = () => {
    const horaAtual = isStoreOpen(configuracaoLoja?.horarioFuncionamento);
    
    if (modoOperacao === 'fechado_forcado') {
      return {
        status: 'Fechado Forçado',
        color: 'bg-red-600 text-red-100',
        icon: AlertTriangle,
        description: 'Cardápio forçadamente fechado pelo administrador'
      };
    }

    if (isFeriado) {
      return {
        status: 'Fechado (Feriado)',
        color: 'bg-orange-600 text-orange-100',
        icon: Calendar,
        description: 'Fechado devido a feriado cadastrado'
      };
    }

    if (modoOperacao === 'manual') {
      return {
        status: cardapioStatus ? 'Aberto (Manual)' : 'Fechado (Manual)',
        color: cardapioStatus ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100',
        icon: Power,
        description: 'Controle manual ativo - ignora horário de funcionamento'
      };
    }

    if (modoOperacao === 'automatico') {
      return {
        status: cardapioStatus ? 'Aberto (Auto)' : 'Fechado (Auto)',
        color: cardapioStatus ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100',
        icon: Clock,
        description: `Controle automático - ${horaAtual ? 'dentro' : 'fora'} do horário de funcionamento`
      };
    }

    return {
      status: 'Desconhecido',
      color: 'bg-gray-600 text-gray-100',
      icon: Store,
      description: 'Status desconhecido'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="powerbi-card">
      <CardHeader className="powerbi-card-header">
        <CardTitle className="flex items-center gap-3 powerbi-title">
          <div className="p-2 rounded-lg bg-primary/10">
            <Power className="h-5 w-5 text-primary" />
          </div>
          Controle Inteligente do Cardápio
        </CardTitle>
      </CardHeader>
      <CardContent className="powerbi-card-content space-y-6">
        {/* Status Atual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${statusInfo.color}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{statusInfo.status}</h3>
              <p className="text-sm text-gray-500">{statusInfo.description}</p>
            </div>
          </div>
          {isChecking && (
            <Badge variant="secondary" className="animate-pulse">
              Verificando...
            </Badge>
          )}
        </div>

        {/* Controle de Modo */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Modo de Operação</Label>
          <Select value={modoOperacao} onValueChange={handleModoChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatico">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Automático - Baseado no horário
                </div>
              </SelectItem>
              <SelectItem value="manual">
                <div className="flex items-center gap-2">
                  <Power className="h-4 w-4" />
                  Manual - Controle direto
                </div>
              </SelectItem>
              <SelectItem value="fechado_forcado">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Fechado Forçado - Sempre fechado
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Controle Manual */}
        {modoOperacao === 'manual' && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <h4 className="font-medium">Controle Manual</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ativar/desativar cardápio manualmente
              </p>
            </div>
            <Switch
              checked={cardapioStatus}
              onCheckedChange={handleManualToggle}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        )}

        {/* Gestão de Feriados */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Feriados e Datas Especiais
          </Label>
          
          <div className="flex gap-2">
            <Input
              type="date"
              value={novaDataFeriado}
              onChange={(e) => setNovaDataFeriado(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAdicionarFeriado} size="sm">
              Adicionar
            </Button>
          </div>

          {feriadosFechamento.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Datas cadastradas para fechamento:
              </p>
              <div className="flex flex-wrap gap-2">
                {feriadosFechamento.map((data) => (
                  <Badge
                    key={data}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                    onClick={() => handleRemoverFeriado(data)}
                  >
                    {data} ✕
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="font-medium mb-2">Como funciona:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li><strong>Automático:</strong> Segue o horário de funcionamento cadastrado</li>
            <li><strong>Manual:</strong> Você controla quando abrir/fechar</li>
            <li><strong>Fechado Forçado:</strong> Mantém sempre fechado</li>
            <li><strong>Feriados:</strong> Têm prioridade sobre outros modos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
