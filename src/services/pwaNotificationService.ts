// Serviço para gerenciar notificações PWA
export class PWANotificationService {
  private static instance: PWANotificationService;
  
  private constructor() {}
  
  static getInstance(): PWANotificationService {
    if (!PWANotificationService.instance) {
      PWANotificationService.instance = new PWANotificationService();
    }
    return PWANotificationService.instance;
  }

  // Solicita permissão para notificações
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // Envia notificação local
  async sendNotification(title: string, options?: NotificationOptions) {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      const defaultOptions: NotificationOptions = {
        icon: '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png',
        badge: '/lovable-uploads/ac9a4a20-a7e9-4ab9-8416-9296f0410f67.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options
      };

      // Se há service worker, usa ele para a notificação
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, defaultOptions);
          return;
        } catch (error) {
          console.log('Erro ao enviar notificação via SW, usando fallback:', error);
        }
      }

      // Fallback para notificação direta
      new Notification(title, defaultOptions);
    }
  }

  // Notificação específica para novos pedidos
  async notifyNewOrder(orderNumber: string, customerName: string) {
    await this.sendNotification('🍽️ Novo Pedido!', {
      body: `Pedido #${orderNumber} de ${customerName}`,
      tag: 'new-order',
      data: { orderNumber, customerName },
      actions: [
        {
          action: 'view',
          title: 'Ver Pedido'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ]
    });
  }

  // Notificação para mudança de status
  async notifyStatusChange(orderNumber: string, status: string) {
    await this.sendNotification('📋 Status Atualizado', {
      body: `Pedido #${orderNumber} está ${status}`,
      tag: 'status-change',
      data: { orderNumber, status }
    });
  }

  // Verifica se as notificações estão habilitadas
  isNotificationEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Verifica se o PWA está instalado
  isPWAInstalled(): boolean {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    return isStandalone || isIOSStandalone;
  }
}

export const pwaNotificationService = PWANotificationService.getInstance();