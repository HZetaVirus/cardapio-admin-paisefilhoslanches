// Utilitários para debug do sistema de fidelidade

export const resetFidelityForClient = (clienteId: number) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const storageKey = `fidelity_played_${clienteId}_${currentMonth}_${currentYear}`;
  
  localStorage.removeItem(storageKey);
  console.log(`Fidelidade resetada para cliente ${clienteId}`);
};

export const checkFidelityStatus = (clienteId: number) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const storageKey = `fidelity_played_${clienteId}_${currentMonth}_${currentYear}`;
  
  const hasPlayed = localStorage.getItem(storageKey) === 'true';
  console.log(`Cliente ${clienteId} já jogou este mês:`, hasPlayed);
  return hasPlayed;
};

// Para usar no console do navegador:
// window.resetFidelity = (clienteId) => resetFidelityForClient(clienteId);
// window.checkFidelity = (clienteId) => checkFidelityStatus(clienteId);

if (typeof window !== 'undefined') {
  (window as any).resetFidelity = resetFidelityForClient;
  (window as any).checkFidelity = checkFidelityStatus;
}