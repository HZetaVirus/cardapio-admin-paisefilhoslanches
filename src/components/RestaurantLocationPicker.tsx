import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Check, X } from 'lucide-react';
import { toast } from 'sonner';

// Importações do Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RestaurantLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAddress: string;
  currentCoordinates: [number, number] | null;
  onLocationSelected: (address: string, coordinates: [number, number]) => void;
}

export default function RestaurantLocationPicker({
  open,
  onOpenChange,
  currentAddress,
  currentCoordinates,
  onLocationSelected
}: RestaurantLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [searchAddress, setSearchAddress] = useState(currentAddress);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(currentCoordinates);
  const [selectedAddress, setSelectedAddress] = useState(currentAddress);
  const [loading, setLoading] = useState(false);

  // Coordenadas de Belford Roxo, RJ
  const belfordRoxoCenter: [number, number] = [-22.7644, -43.3995];

  // Inicializar mapa quando modal abrir
  useEffect(() => {
    if (open && mapRef.current && !mapInstanceRef.current) {
      const timer = setTimeout(() => {
        initializeMap();
      }, 200);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup quando modal fechar
    if (!open && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [open]);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      console.log('Inicializando mapa...');
      
      // Coordenadas iniciais
      const initialCoords = currentCoordinates || belfordRoxoCenter;
      
      // Criar o mapa
      const map = L.map(mapRef.current, {
        center: initialCoords,
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false
      });

      // Adicionar tiles do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);



      // Forçar redimensionamento
      setTimeout(() => {
        map.invalidateSize();
        console.log('Mapa redimensionado');
      }, 100);

      // Adicionar marcador inicial se houver coordenadas
      if (currentCoordinates) {
        addMarker(map, currentCoordinates, '📍 Localização Atual');
      }

      // Evento de clique no mapa
      map.on('click', async (e) => {
        const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
        console.log('Clique no mapa:', coords);
        
        // Adicionar marcador na nova posição
        addMarker(map, coords, '📍 Nova Localização');
        
        setSelectedCoordinates(coords);
        
        // Buscar endereço
        const address = await reverseGeocode(coords);
        if (address) {
          setSelectedAddress(address);
          setSearchAddress(address);
        }
      });

      mapInstanceRef.current = map;
      console.log('Mapa inicializado com sucesso');
      
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      toast.error('Erro ao carregar o mapa');
    }
  };

  const addMarker = (map: L.Map, coords: [number, number], popupText: string) => {
    // Remover marcador anterior
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    
    // Criar novo marcador
    const marker = L.marker(coords, {
      draggable: true
    }).addTo(map);
    
    marker.bindPopup(popupText).openPopup();
    
    // Evento de arrastar
    marker.on('dragend', async (e) => {
      const newCoords: [number, number] = [e.target.getLatLng().lat, e.target.getLatLng().lng];
      console.log('Marcador arrastado para:', newCoords);
      
      setSelectedCoordinates(newCoords);
      
      const address = await reverseGeocode(newCoords);
      if (address) {
        setSelectedAddress(address);
        setSearchAddress(address);
      }
    });
    
    markerRef.current = marker;
  };

  const reverseGeocode = async (coords: [number, number]): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CardapioDigital/1.0'
          }
        }
      );
      
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Erro no geocoding reverso:', error);
      return null;
    }
  };

  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      toast.error('Digite um endereço para buscar');
      return;
    }

    try {
      setLoading(true);
      
      // Adicionar "Belford Roxo, RJ" se não estiver no endereço
      let fullAddress = searchAddress;
      if (!fullAddress.toLowerCase().includes('belford roxo')) {
        fullAddress += ', Belford Roxo, RJ, Brasil';
      }
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=br`,
        {
          headers: {
            'User-Agent': 'CardapioDigital/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      if (data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        
        // Mover o mapa para a nova localização
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, 16);
          addMarker(mapInstanceRef.current, coords, '📍 Localização Encontrada');
        }
        
        setSelectedCoordinates(coords);
        setSelectedAddress(data[0].display_name);
        toast.success('Localização encontrada!');
      } else {
        toast.error('Endereço não encontrado em Belford Roxo');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar localização');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedCoordinates || !selectedAddress) {
      toast.error('Selecione uma localização no mapa');
      return;
    }
    
    onLocationSelected(selectedAddress, selectedCoordinates);
    onOpenChange(false);
    toast.success('Localização do restaurante definida!');
  };

  const handleCancel = () => {
    setSearchAddress(currentAddress);
    setSelectedCoordinates(currentCoordinates);
    setSelectedAddress(currentAddress);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Definir Localização do Restaurante
          </DialogTitle>
          <DialogDescription>
            Marque a localização exata do seu restaurante em Belford Roxo, RJ. 
            Clique no mapa ou arraste o marcador para ajustar a posição.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de busca */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-address">Buscar Endereço</Label>
              <Input
                id="search-address"
                placeholder="Digite o endereço em Belford Roxo..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchLocation}
                disabled={loading}
                variant="outline"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Container do Mapa */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              ref={mapRef} 
              className="w-full h-96"
              style={{ 
                minHeight: '400px',
                height: '400px'
              }}
            />
          </div>

          {/* Informações da localização selecionada */}
          {selectedCoordinates && (
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium mb-2">Localização Selecionada:</h4>
              <p className="text-sm text-muted-foreground mb-2">{selectedAddress}</p>
              <p className="text-xs text-muted-foreground">
                Coordenadas: {selectedCoordinates[0].toFixed(6)}, {selectedCoordinates[1].toFixed(6)}
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedCoordinates}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar Localização
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}