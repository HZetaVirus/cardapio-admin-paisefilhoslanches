import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff } from 'lucide-react';
import { pwaNotificationService } from '@/services/pwaNotificationService';
import { toast } from 'sonner';

const PWANotificationSettings: React.FC = () => {
  const [notificationEnabled, setNotificationEnabled] = React.useState(
    pwaNotificationService.isNotificationEnabled()
  );

  const handleToggleNotifications = async () => {
    if (!notificationEnabled) {
      const permission = await pwaNotificationService.requestPermission();
      if (permission === 'granted') {
        setNotificationEnabled(true);
        toast.success('Notificações ativadas!', {
          description: 'Você receberá alertas sobre novos pedidos.'
        });
      } else {
        toast.error('Permissão negada', {
          description: 'Ative as notificações nas configurações do navegador.'
        });
      }
    } else {
      toast.info('Para desativar notificações', {
        description: 'Acesse as configurações do seu navegador.'
      });
    }
  };

  const testNotification = async () => {
    if (notificationEnabled) {
      await pwaNotificationService.sendNotification('🧪 Teste de Notificação', {
        body: 'Esta é uma notificação de teste do painel admin.',
        tag: 'test'
      });
      toast.success('Notificação de teste enviada!');
    } else {
      toast.error('Ative as notificações primeiro');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {notificationEnabled ? (
            <Bell className="h-5 w-5 text-green-500" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-500" />
          )}
          Notificações PWA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="text-sm">
            Receber notificações de novos pedidos
          </Label>
          <Switch
            id="notifications"
            checked={notificationEnabled}
            onCheckedChange={handleToggleNotifications}
          />
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {notificationEnabled ? (
            'Você receberá alertas quando novos pedidos chegarem.'
          ) : (
            'Ative para receber alertas em tempo real sobre pedidos.'
          )}
        </div>

        {notificationEnabled && (
          <Button
            onClick={testNotification}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Testar Notificação
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PWANotificationSettings;