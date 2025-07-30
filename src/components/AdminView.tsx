
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AdminProductsForm from "./AdminProductsForm";
import AdminChartsView from "./AdminChartsView";
import AdminStoreSettings from "./AdminStoreSettings";
import AdminHeader from "./admin/AdminHeader";
import FechamentoDia from "./admin/FechamentoDia";
import AdminClientesChat from "./admin/AdminClientesChat";
import AdminTabsNavigation from "./admin/AdminTabsNavigation";
import AdminPedidosTab from "./admin/AdminPedidosTab";
import AdminPrinterStatus from "./admin/AdminPrinterStatus";
import DeliveryManagement from "./DeliveryManagement";

import { useAdminViewLogic } from "./admin/AdminViewLogic";

import { useApp } from "@/contexts/AppContext";

import AdminThemeProvider from "./AdminThemeProvider";


export default function AdminView() {
  const { pedidos } = useApp();
  const {
    filtroStatus,
    setFiltroStatus,
    currentTab,
    setCurrentTab,
    clienteDialogOpen,
    setClienteDialogOpen,
    statusOptions,
    selectedCliente,
    currentPedidosFiltrados,
    handleImprimirPedido,
    handleShowClienteDetails,
    atualizarStatusPedido,
    clientes,
    logout
  } = useAdminViewLogic();



  return (
    <div className="powerbi-dashboard">
      <div className="container mx-auto py-4 px-2 md:py-6 md:px-4">
        <div className="powerbi-header rounded-xl mb-6 p-4">
          <AdminHeader onLogout={logout} />
        </div>
        
        <AdminPrinterStatus />
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full mb-6">
          <div className="powerbi-tabs p-2 mb-6">
            <AdminTabsNavigation currentTab={currentTab} />
          </div>
          
          <TabsContent value="pedidos" className="space-y-6">
            <AdminPedidosTab
              filtroStatus={filtroStatus}
              setFiltroStatus={setFiltroStatus}
              statusOptions={statusOptions}
              currentPedidosFiltrados={currentPedidosFiltrados}
              clientes={clientes}
              atualizarStatusPedido={atualizarStatusPedido}
              handleImprimirPedido={handleImprimirPedido}
              handleShowClienteDetails={handleShowClienteDetails}
              selectedCliente={selectedCliente}
              clienteDialogOpen={clienteDialogOpen}
              setClienteDialogOpen={setClienteDialogOpen}
            />
          </TabsContent>
          
          <TabsContent value="produtos" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <AdminProductsForm />
            </div>
          </TabsContent>
          
          <TabsContent value="clientes" className="space-y-6">
            <AdminClientesChat />
          </TabsContent>
          
          <TabsContent value="financeiro" className="space-y-6">
            <AdminChartsView />
          </TabsContent>
          
          <TabsContent value="entrega" className="space-y-6">
            <DeliveryManagement />
          </TabsContent>
          
          <TabsContent value="configuracoes" className="space-y-6">
            <div className="space-y-6">
              <FechamentoDia />
              <AdminStoreSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
