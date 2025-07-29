import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, RefreshCw } from 'lucide-react';
import { PWAUtils } from '@/utils/pwaConfig';

const PWADebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = React.useState(PWAUtils.getDeviceInfo());
  const [swRegistration, setSWRegistration] = React.useState<ServiceWorkerRegistration | null>(null);

  React.useEffect(() => {
    // Obtém informações do service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setSWRegistration(registration);
      });
    }
  }, []);

  const refreshInfo = () => {
    setDebugInfo(PWAUtils.getDeviceInfo());
    PWAUtils.debugPWA();
  };

  const updateServiceWorker = async () => {
    if (swRegistration) {
      await swRegistration.update();
      window.location.reload();
    }
  };

  // Só mostra em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <Info className="h-4 w-4" />
          PWA Debug (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>PWA:</span>
            <Badge variant={PWAUtils.isPWA() ? 'default' : 'secondary'} className="text-xs">
              {PWAUtils.isPWA() ? 'Sim' : 'Não'}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>Online:</span>
            <Badge variant={PWAUtils.isOnline() ? 'default' : 'destructive'} className="text-xs">
              {PWAUtils.isOnline() ? 'Sim' : 'Não'}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>SW:</span>
            <Badge variant={PWAUtils.supportsServiceWorker() ? 'default' : 'secondary'} className="text-xs">
              {PWAUtils.supportsServiceWorker() ? 'Sim' : 'Não'}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>Notif:</span>
            <Badge variant={PWAUtils.supportsNotifications() ? 'default' : 'secondary'} className="text-xs">
              {PWAUtils.supportsNotifications() ? 'Sim' : 'Não'}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div>Platform: {debugInfo.platform}</div>
          <div>Language: {debugInfo.language}</div>
          {swRegistration && (
            <div>SW: {swRegistration.active?.state || 'N/A'}</div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={refreshInfo} size="sm" variant="outline" className="text-xs h-7">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          
          {swRegistration && (
            <Button onClick={updateServiceWorker} size="sm" variant="outline" className="text-xs h-7">
              Update SW
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PWADebugInfo;