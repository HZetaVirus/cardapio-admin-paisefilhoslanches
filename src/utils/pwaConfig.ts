// Configurações PWA centralizadas
export const PWA_CONFIG = {
  APP_NAME: 'Admin - Cardápio Digital',
  SHORT_NAME: 'Admin Cardápio',
  DESCRIPTION: 'Painel administrativo do Cardápio Digital - Gerencie pedidos, cardápio e configurações.',
  THEME_COLOR: '#1e40af',
  BACKGROUND_COLOR: '#f8fafc',
  ICON_PATH: '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png',
  
  // Configurações de notificação
  NOTIFICATION_OPTIONS: {
    icon: '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png',
    badge: '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    silent: false
  },
  
  // Configurações de cache
  CACHE_NAME: 'cardapio-admin-v1',
  CACHE_URLS: [
    '/',
    '/index.html',
    '/manifest.json',
    '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png'
  ],
  
  // URLs que não devem ser cacheadas
  EXCLUDE_CACHE_URLS: [
    /.*\.supabase\.co.*/,
    /.*googleapis\.com.*/,
    /.*openstreetmap\.org.*/
  ]
};

// Utilitários PWA
export const PWAUtils = {
  // Verifica se é PWA
  isPWA(): boolean {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    return isStandalone || isIOSStandalone;
  },

  // Verifica se está online
  isOnline(): boolean {
    return navigator.onLine;
  },

  // Verifica suporte a notificações
  supportsNotifications(): boolean {
    return 'Notification' in window;
  },

  // Verifica suporte a service worker
  supportsServiceWorker(): boolean {
    return 'serviceWorker' in navigator;
  },

  // Obtém informações do dispositivo
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency
    };
  },

  // Log de debug PWA
  debugPWA() {
    console.group('🔍 PWA Debug Info');
    console.log('Is PWA:', this.isPWA());
    console.log('Is Online:', this.isOnline());
    console.log('Supports Notifications:', this.supportsNotifications());
    console.log('Supports Service Worker:', this.supportsServiceWorker());
    console.log('Device Info:', this.getDeviceInfo());
    console.log('Display Mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
    console.groupEnd();
  }
};