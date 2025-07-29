
import { Button } from "@/components/ui/button";
import { useRawbtIntegration } from '@/hooks/useRawbtIntegration';

export default function AdminPrinterStatus() {
  const { testarImpressora, rawbtDisponivel } = useRawbtIntegration();

  if (!rawbtDisponivel) return null;

  return (
    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Impressora Rawbt conectada - Impressão automática ativa
          </span>
        </div>
        <Button 
          onClick={testarImpressora}
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          Testar Impressora
        </Button>
      </div>
    </div>
  );
}
