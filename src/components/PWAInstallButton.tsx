import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

const PWAInstallButton: React.FC = () => {
  const { canInstall, isInstalled, installPWA } = usePWA();

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      toast.success('App instalado com sucesso!', {
        description: 'Agora você pode acessar o painel admin diretamente da tela inicial.'
      });
    } else {
      toast.error('Não foi possível instalar o app', {
        description: 'Tente novamente mais tarde.'
      });
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Smartphone className="h-4 w-4" />
        <span>App instalado</span>
      </div>
    );
  }

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Instalar App
    </Button>
  );
};

export default PWAInstallButton;