export const DELIVERY_CONFIG = {
  // Coordenadas do restaurante (São Paulo - exemplo)
  restaurantCoords: [-23.5505, -46.6333] as [number, number],
  
  // URLs das APIs
  nominatimUrl: 'https://nominatim.openstreetmap.org/search',
  osrmUrl: 'https://router.project-osrm.org/route/v1/driving',
  
  // Configurações do mapa
  defaultZoom: 13,
  routeColor: '#3B82F6',
  routeWeight: 4,
  routeOpacity: 0.7,
  
  // Configurações de entrega
  maxDeliveryTime: 45, // minutos
};