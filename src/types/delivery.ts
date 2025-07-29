export interface DeliveryLocation {
  address: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface DeliveryInfo {
  deliveryFee: number;
  estimatedTime: string;
  distance: string;
}