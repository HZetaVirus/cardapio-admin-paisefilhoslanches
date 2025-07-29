
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminEditarItens from "./admin/AdminEditarItens";
import AdminRelatorioMensal from "./admin/AdminRelatorioMensal";
import AdminPreviewLoja from "./admin/AdminPreviewLoja";
import CardapioStatusToggle from "./admin/CardapioStatusToggle";
import { Store } from "lucide-react";

export default function AdminStoreSettings() {
  return (
    <div className="space-y-6">
      {/* Status do Cardápio - Sempre visível no topo */}
      <CardapioStatusToggle />
      
      <div className="powerbi-card">
        <CardHeader className="powerbi-card-header">
          <CardTitle className="flex items-center gap-3 powerbi-title">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            Configurações da Loja
          </CardTitle>
        </CardHeader>
        <CardContent className="powerbi-card-content">
          <Tabs defaultValue="aparencia" className="w-full">
            <TabsList className="grid w-full grid-cols-3 powerbi-tabs p-1">
              <TabsTrigger value="aparencia" className="powerbi-tab-trigger">
                Aparência
              </TabsTrigger>
              <TabsTrigger value="cardapio" className="powerbi-tab-trigger">
                Editar Cardápio
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="powerbi-tab-trigger">
                Relatórios
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="aparencia" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminPreviewLoja />
              </div>
            </TabsContent>
            
            <TabsContent value="cardapio" className="mt-6">
              <AdminEditarItens />
            </TabsContent>
            
            <TabsContent value="relatorios" className="mt-6">
              <AdminRelatorioMensal />
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </div>
  );
}
