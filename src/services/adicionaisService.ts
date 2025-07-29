
import type { Adicional } from "@/types";

// Mock data for adicionais since the table doesn't exist in the database yet
const mockAdicionais: Adicional[] = [
  { id: 1, nome_adicional: "Ovo", preco: 2.00, categoria_adicional: "Extras" },
  { id: 2, nome_adicional: "Molho Especial", preco: 1.50, categoria_adicional: "Molhos" },
  { id: 3, nome_adicional: "Cebola Caramelizada", preco: 2.50, categoria_adicional: "Extras" },
  { id: 4, nome_adicional: "Picles", preco: 1.00, categoria_adicional: "Extras" },
  { id: 5, nome_adicional: "Molho Barbecue", preco: 1.50, categoria_adicional: "Molhos" },
  { id: 6, nome_adicional: "Molho Ranch", preco: 1.50, categoria_adicional: "Molhos" },
  { id: 7, nome_adicional: "Cebola Roxa", preco: 1.00, categoria_adicional: "Extras" },
  { id: 8, nome_adicional: "Tomate", preco: 1.50, categoria_adicional: "Extras" }
];

export const getAdicionais = async (): Promise<Adicional[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockAdicionais;
};

export const insertAdicional = async (adicional: Omit<Adicional, 'id'>): Promise<Adicional | null> => {
  // Mock implementation - in a real app this would insert to database
  await new Promise(resolve => setTimeout(resolve, 100));
  const newAdicional: Adicional = {
    id: Math.max(...mockAdicionais.map(a => a.id)) + 1,
    ...adicional
  };
  mockAdicionais.push(newAdicional);
  return newAdicional;
};

export const updateAdicional = async (adicional: Adicional): Promise<boolean> => {
  // Mock implementation - in a real app this would update the database
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = mockAdicionais.findIndex(a => a.id === adicional.id);
  if (index !== -1) {
    mockAdicionais[index] = adicional;
    return true;
  }
  return false;
};

export const deleteAdicional = async (adicionalId: number): Promise<boolean> => {
  // Mock implementation - in a real app this would delete from database
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = mockAdicionais.findIndex(a => a.id === adicionalId);
  if (index !== -1) {
    mockAdicionais.splice(index, 1);
    return true;
  }
  return false;
};
