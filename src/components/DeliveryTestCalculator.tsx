import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { DeliveryCalculationService, DeliveryCalculationResult } from '@/services/deliveryCalculationService';

export default function DeliveryTestCalculator() {
  const [enderecoTeste, setEnderecoTeste] = useState('');
  const [bairroTeste, setBairroTeste] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<DeliveryCalculationResult | null>(null);

  const testarCalculo = async () => {
    if (!enderecoTeste.trim()) {
      toast.error('Digite um endereço para testar');
      return;
    }

    try {
      setLoading(true);
      const service = DeliveryCalculationService.getInstance();
      const result = await service.testarCalculo(enderecoTeste, bairroTeste);
      setResultado(result);

      if (result.success) {
        toast.success('Cálculo realizado com sucesso!');
      } else {
        toast.error(result.erro || 'Erro no cálculo');
      }
    } catch (error) {
      console.error('Erro ao testar cálculo:', error);
      toast.error('Erro inesperado no teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Teste de Cálculo de Entrega
        </CardTitle>
        <CardDescription>
          Teste o cálculo de taxa de entrega para diferentes endereços
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endereco-teste">Endereço Completo</Label>
            <Input
              id="endereco-teste"
              placeholder="Rua, número, bairro, cidade"
              value={enderecoTeste}
              onChange={(e) => setEnderecoTeste(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bairro-teste">Bairro (opcional)</Label>
            <Input
              id="bairro-teste"
              placeholder="Nome do bairro"
              value={bairroTeste}
              onChange={(e) => setBairroTeste(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={testarCalculo}
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Taxa
            </>
          )}
        </Button>

        {resultado && (
          <div className="mt-6 p-4 border rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Resultado do Cálculo
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div>
                  <Badge variant={resultado.success ? "default" : "destructive"}>
                    {resultado.success ? "Sucesso" : "Erro"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Taxa de Entrega</Label>
                <p className="font-medium">
                  {resultado.success ? `R$ ${resultado.taxa.toFixed(2)}` : '-'}
                </p>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Método</Label>
                <p className="font-medium capitalize">
                  {resultado.metodo === 'bairro' ? 'Por Bairro' : 'Por Quilometragem'}
                </p>
              </div>
              
              {resultado.distancia && (
                <div>
                  <Label className="text-xs text-muted-foreground">Distância</Label>
                  <p className="font-medium">{resultado.distancia.toFixed(2)} km</p>
                </div>
              )}
            </div>

            {resultado.erro && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{resultado.erro}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Como Usar o Teste</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Digite um endereço completo para obter o melhor resultado</li>
            <li>• Se especificar o bairro, o sistema tentará usar a taxa por bairro primeiro</li>
            <li>• Caso não encontre por bairro, calculará automaticamente por quilometragem</li>
            <li>• O cálculo usa a API do OpenStreetMaps para coordenadas e distâncias reais</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}