import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Banknote, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentConfig {
  mercado_pago_access_token: string;
  mercado_pago_public_key: string;
  pix_habilitado: boolean;
  cartao_habilitado: boolean;
  dinheiro_habilitado: boolean;
}

export default function PaymentConfiguration() {
  const [config, setConfig] = useState<PaymentConfig>({
    mercado_pago_access_token: '',
    mercado_pago_public_key: '',
    pix_habilitado: false,
    cartao_habilitado: false,
    dinheiro_habilitado: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('configuracao_pagamento')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          mercado_pago_access_token: data.mercado_pago_access_token || '',
          mercado_pago_public_key: data.mercado_pago_public_key || '',
          pix_habilitado: data.pix_habilitado || false,
          cartao_habilitado: data.cartao_habilitado || false,
          dinheiro_habilitado: data.dinheiro_habilitado !== false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração de pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('configuracao_pagamento')
        .upsert({
          mercado_pago_access_token: config.mercado_pago_access_token,
          mercado_pago_public_key: config.mercado_pago_public_key,
          pix_habilitado: config.pix_habilitado,
          cartao_habilitado: config.cartao_habilitado,
          dinheiro_habilitado: config.dinheiro_habilitado
        });

      if (error) throw error;

      toast.success('Configuração de pagamentos salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const testMercadoPagoConnection = async () => {
    if (!config.mercado_pago_access_token) {
      toast.error('Configure o Access Token primeiro');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('https://api.mercadopago.com/v1/account/settings', {
        headers: {
          'Authorization': `Bearer ${config.mercado_pago_access_token}`
        }
      });

      if (response.ok) {
        toast.success('Conexão com Mercado Pago OK!');
      } else {
        toast.error('Erro na conexão com Mercado Pago');
      }
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Carregando configurações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configuração de Pagamentos
          </CardTitle>
          <CardDescription>
            Configure as formas de pagamento disponíveis para seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formas de Pagamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Formas de Pagamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Dinheiro</p>
                    <p className="text-sm text-muted-foreground">Pagamento na entrega</p>
                  </div>
                </div>
                <Switch
                  checked={config.dinheiro_habilitado}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, dinheiro_habilitado: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                  </div>
                </div>
                <Switch
                  checked={config.pix_habilitado}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, pix_habilitado: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Cartão</p>
                    <p className="text-sm text-muted-foreground">Crédito/Débito</p>
                  </div>
                </div>
                <Switch
                  checked={config.cartao_habilitado}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, cartao_habilitado: checked }))
                  }
                  disabled={true}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Configuração Mercado Pago */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Mercado Pago</h3>
              <Badge variant={config.mercado_pago_access_token ? "default" : "secondary"}>
                {config.mercado_pago_access_token ? "Configurado" : "Não configurado"}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="access-token">Access Token *</Label>
                <div className="flex gap-2">
                  <Input
                    id="access-token"
                    type={showTokens ? "text" : "password"}
                    placeholder="APP_USR-..."
                    value={config.mercado_pago_access_token}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, mercado_pago_access_token: e.target.value }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowTokens(!showTokens)}
                  >
                    {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Token de acesso para processar pagamentos
                </p>
              </div>

              <div>
                <Label htmlFor="public-key">Public Key</Label>
                <Input
                  id="public-key"
                  type={showTokens ? "text" : "password"}
                  placeholder="APP_USR-..."
                  value={config.mercado_pago_public_key}
                  onChange={(e) => 
                    setConfig(prev => ({ ...prev, mercado_pago_public_key: e.target.value }))
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Chave pública para integração frontend (opcional)
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={testMercadoPagoConnection}
                  disabled={!config.mercado_pago_access_token || loading}
                >
                  Testar Conexão
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Instruções */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Como configurar o Mercado Pago:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Acesse sua conta no <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mercado Pago Developers</a></li>
              <li>Vá em "Suas integrações" → "Criar aplicação"</li>
              <li>Escolha "Pagamentos online" e configure sua aplicação</li>
              <li>Copie o "Access Token" de produção e cole acima</li>
              <li>Ative o PIX nas configurações da sua conta</li>
              <li>Teste a conexão e salve as configurações</li>
            </ol>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button 
              onClick={saveConfiguration}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}