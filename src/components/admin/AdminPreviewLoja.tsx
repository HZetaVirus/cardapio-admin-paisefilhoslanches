
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Clock, MapPin } from "lucide-react";

export default function AdminPreviewLoja() {
  const { configuracaoLoja } = useApp();

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Pré-visualização</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center md:flex-row md:items-start gap-4 p-4 rounded-lg border">
          <div 
            className="w-32 h-32 flex items-center justify-center rounded-lg overflow-hidden"
            style={{ backgroundColor: configuracaoLoja?.logoBgColor || '#ffffff' }}
          >
            {configuracaoLoja?.logoUrl ? (
              <img 
                src={configuracaoLoja.logoUrl} 
                alt="Logo da loja" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Store className="w-16 h-16 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Cardápio Digital</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {configuracaoLoja?.descricao || "Descrição da sua loja aparecerá aqui"}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {configuracaoLoja?.endereco || "Endereço da sua loja aparecerá aqui"}
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {configuracaoLoja?.horarioFuncionamento || "Horários de funcionamento aparecerão aqui"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
