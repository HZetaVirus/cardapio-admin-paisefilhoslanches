// Utilitários para lidar com responsividade
export const getViewportHeight = (): number => {
  // Altura do viewport em diferentes navegadores/dispositivos
  return Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
};

export const getViewportWidth = (): number => {
  // Largura do viewport em diferentes navegadores/dispositivos
  return Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
};

// Detecta se está rodando como APK/TWA
export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  );
};

// Ajusta altura para telas com notch ou barras de sistema
export const getSafeAreaInsets = (): {
  top: number;
  bottom: number;
} => {
  const computedStyle = window.getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0')
  };
};

// Detecta orientação do dispositivo
export const getOrientation = (): 'portrait' | 'landscape' => {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};
