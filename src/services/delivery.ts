import { Location, RouteInfo } from '@/types/delivery';
import OSRM from 'osrm-client';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    return null;
  }
};

export const calculateRoute = async (
  start: Location,
  end: Location
): Promise<RouteInfo> => {
  const osrm = new OSRM('https://router.project-osrm.org');
  
  return new Promise((resolve, reject) => {
    osrm.route({
      coordinates: [[start.lon, start.lat], [end.lon, end.lat]],
      geometries: 'geojson',
      overview: 'full'
    }, (err: any, result: any) => {
      if (err) reject(err);
      
      resolve({
        distance: result.routes[0].distance,
        duration: result.routes[0].duration,
        geometry: result.routes[0].geometry
      });
    });
  });
};
