import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calculator, Trash2, Plus, Settings, Navigation, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import DeliveryTestCalculator from './DeliveryTestCalculator';
import RestaurantLocationPicker from './RestaurantLocationPicker';

interface TaxaEntrega {
  id: number;
  bairro: string;
  taxa: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface ConfiguracaoEntrega {
  taxaPorKm: number;
  taxaMinima: number;
  taxaMaxima: number;
  raioMaximo: number;
  enderecoRestaurante: string;
  coordenadasRestaurante: [number, number] | null;
}

export default function DeliveryManagement() {
  const [taxasBairro, setTaxasBairro] = useState<TaxaEntrega[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoEntrega>({
    taxaPorKm: 2.50,
    taxaMinima: 3.00,
    taxaMaxima: 15.00,
    raioMaximo: 10,
    enderecoRestaurante: '',
    coordenadasRestaurante: null
  });
  const [loading, setLoading] = useState(false);
  const [novoBairro, setNovoBairro] = useState('');
  const [novaTaxa, setNovaTaxa] = useState('');
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Carregar dados existentes
  useEffect(() => {
    carregarTaxasBairro();
    carregarConfiguracaoEntrega();
  }, []);

  const carregarTaxasBairro = async () => {
    try {
      const { data, error } = await supabase
        .from('taxas_entrega')
        .select('*')
        .order('bairro');

      if (error) throw error;
      setTaxasBairro(data || []);
    } catch (error) {
      console.error('Erro ao carregar taxas por bairro:', error);
      toast.error('Erro ao carregar taxas de entrega');
    }
  };

  const carregarConfiguracaoEntrega = async () => {
    // Por enquanto, usar configuração local
    // Futuramente pode ser salva no banco de dados
    const configSalva = localStorage.getItem('configuracao_entrega');
    if (configSalva) {
      setConfiguracao(JSON.parse(configSalva));
    }
  };

  const salvarConfiguracaoEntrega = async () => {
    try {
      localStorage.setItem('configuracao_entrega', JSON.stringify(configuracao));
      toast.success('Configuração de entrega salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const adicionarTaxaBairro = async () => {
    if (!novoBairro.trim() || !novaTaxa.trim()) {
      toast.error('Preencha o bairro e a taxa');
      return;
    }

    const taxa = parseFloat(novaTaxa);
    if (isNaN(taxa) || taxa < 0) {
      toast.error('Taxa deve ser um número válido');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('taxas_entrega')
        .insert([{
          bairro: novoBairro.trim(),
          taxa: taxa,
          ativo: true
        }])
        .select()
        .single();

      if (error) throw error;

      setTaxasBairro([...taxasBairro, data]);
      setNovoBairro('');
      setNovaTaxa('');
      toast.success('Taxa de bairro adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar taxa:', error);
      toast.error('Erro ao adicionar taxa de bairro');
    } finally {
      setLoading(false);
    }
  };

  const atualizarTaxaBairro = async (id: number, campo: 'taxa' | 'ativo', valor: number | boolean) => {
    try {
      const { error } = await supabase
        .from('taxas_entrega')
        .update({ [campo]: valor, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setTaxasBairro(taxasBairro.map(taxa => 
        taxa.id === id ? { ...taxa, [campo]: valor } : taxa
      ));
      toast.success('Taxa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar taxa:', error);
      toast.error('Erro ao atualizar taxa');
    }
  };

  const removerTaxaBairro = async (id: number) => {
    try {
      const { error } = await supabase
        .from('taxas_entrega')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTaxasBairro(taxasBairro.filter(taxa => taxa.id !== id));
      toast.success('Taxa removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover taxa:', error);
      toast.error('Erro ao remover taxa');
    }
  };

  const buscarCoordenadas = async () => {
    if (!configuracao.enderecoRestaurante.trim()) {
      toast.error('Digite o endereço do restaurante');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(configuracao.enderecoRestaurante + ', Belford Roxo, RJ, Brasil')}&limit=1&countrycodes=br`
      );
      
      const data = await response.json();
      
      if (data.length > 0) {
        const coordenadas: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setConfiguracao(prev => ({
          ...prev,
          coordenadasRestaurante: coordenadas
        }));
        toast.success('Coordenadas encontradas com sucesso!');
      } else {
        toast.error('Endereço não encontrado em Belford Roxo');
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      toast.error('Erro ao buscar coordenadas');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelected = (address: string, coordinates: [number, number]) => {
    setConfiguracao(prev => ({
      ...prev,
      enderecoRestaurante: address,
      coordenadasRestaurante: coordinates
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Navigation className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Gerenciamento de Entrega</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Sistema de Entrega
          </CardTitle>
          <CardDescription>
            Configure as taxas de entrega por bairro e parâmetros de cálculo de frete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bairros" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bairros">Taxas por Bairro</TabsTrigger>
              <TabsTrigger value="quilometragem">Cálculo por Km</TabsTrigger>
              <TabsTrigger value="teste">Teste de Cálculo</TabsTrigger>
            </TabsList>

            <TabsContent value="bairros" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    placeholder="Nome do bairro"
                    value={novoBairro}
                    onChange={(e) => setNovoBairro(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="taxa">Taxa (R$)</Label>
                  <Input
                    id="taxa"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={novaTaxa}
                    onChange={(e) => setNovaTaxa(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={adicionarTaxaBairro}
                    disabled={loading}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Taxas Cadastradas ({taxasBairro.length})</h4>
                {taxasBairro.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma taxa por bairro cadastrada
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {taxasBairro.map((taxa) => (
                      <div key={taxa.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{taxa.bairro}</p>
                            <p className="text-sm text-muted-foreground">
                              R$ {taxa.taxa.toFixed(2)}
                            </p>
                          </div>
                          <Badge variant={taxa.ativo ? "default" : "secondary"}>
                            {taxa.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={taxa.ativo}
                            onCheckedChange={(checked) => atualizarTaxaBairro(taxa.id, 'ativo', checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerTaxaBairro(taxa.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="quilometragem" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endereco">Endereço do Restaurante</Label>
                  <div className="flex gap-2">
                    <Input
                      id="endereco"
                      placeholder="Rua, número, bairro - Belford Roxo, RJ"
                      value={configuracao.enderecoRestaurante}
                      onChange={(e) => setConfiguracao(prev => ({
                        ...prev,
                        enderecoRestaurante: e.target.value
                      }))}
                    />
                    <Button 
                      onClick={buscarCoordenadas}
                      disabled={loading}
                      variant="outline"
                      title="Buscar coordenadas por texto"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => setMapModalOpen(true)}
                      disabled={loading}
                      variant="outline"
                      title="Abrir mapa para selecionar localização"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  {configuracao.coordenadasRestaurante && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Coordenadas: {configuracao.coordenadasRestaurante[0].toFixed(6)}, {configuracao.coordenadasRestaurante[1].toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="taxaPorKm">Taxa por Km (R$)</Label>
                  <Input
                    id="taxaPorKm"
                    type="number"
                    step="0.01"
                    value={configuracao.taxaPorKm}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      taxaPorKm: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="taxaMinima">Taxa Mínima (R$)</Label>
                  <Input
                    id="taxaMinima"
                    type="number"
                    step="0.01"
                    value={configuracao.taxaMinima}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      taxaMinima: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="taxaMaxima">Taxa Máxima (R$)</Label>
                  <Input
                    id="taxaMaxima"
                    type="number"
                    step="0.01"
                    value={configuracao.taxaMaxima}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      taxaMaxima: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="raioMaximo">Raio Máximo (Km)</Label>
                  <Input
                    id="raioMaximo"
                    type="number"
                    step="0.1"
                    value={configuracao.raioMaximo}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      raioMaximo: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={salvarConfiguracaoEntrega}>
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Como Funciona o Cálculo por Quilometragem
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• A distância é calculada usando a API do OpenStreetMaps</li>
                  <li>• Taxa final = Distância (km) × Taxa por Km</li>
                  <li>• A taxa é limitada entre o valor mínimo e máximo configurados</li>
                  <li>• Entregas fora do raio máximo são rejeitadas automaticamente</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="teste" className="space-y-4">
              <DeliveryTestCalculator />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal do mapa */}
      <RestaurantLocationPicker
        open={mapModalOpen}
        onOpenChange={setMapModalOpen}
        currentAddress={configuracao.enderecoRestaurante}
        currentCoordinates={configuracao.coordenadasRestaurante}
        onLocationSelected={handleLocationSelected}
      />
    </div>
  );
}