
import { Info } from "lucide-react";
import { StatusPedido, Cliente } from "@/types";
import AdminStatusFilters from "./AdminStatusFilters";
import PedidoAdminCard from "./PedidoAdminCard";
import ClienteDetailsDialog from "./ClienteDetailsDialog";

interface AdminPedidosTabProps {
  filtroStatus: StatusPedido;
  setFiltroStatus: (status: StatusPedido) => void;
  statusOptions: Array<{
    value: StatusPedido;
    label: string;
    count: number;
    color: string;
    emoji: string;
  }>;
  currentPedidosFiltrados: any[];
  clientes: Cliente[];
  atualizarStatusPedido: (id: number, status: StatusPedido) => void;
  handleImprimirPedido: (pedido: any) => void;
  handleShowClienteDetails: (clienteId: number) => void;
  selectedCliente: Cliente | null;
  clienteDialogOpen: boolean;
  setClienteDialogOpen: (open: boolean) => void;
}

export default function AdminPedidosTab({
  filtroStatus,
  setFiltroStatus,
  statusOptions,
  currentPedidosFiltrados,
  clientes,
  atualizarStatusPedido,
  handleImprimirPedido,
  handleShowClienteDetails,
  selectedCliente,
  clienteDialogOpen,
  setClienteDialogOpen
}: AdminPedidosTabProps) {
  return (
    <>
      <AdminStatusFilters 
        statusOptions={statusOptions}
        filtroStatus={filtroStatus}
        onStatusChange={setFiltroStatus}
      />
      
      <div className="mb-3 md:mb-4">
        <h3 className="text-lg md:text-xl font-semibold flex items-center">
          <span className="mr-2">
            {statusOptions.find(o => o.value === filtroStatus)?.emoji}
          </span>
          Pedidos {statusOptions.find(o => o.value === filtroStatus)?.label}
        </h3>
      </div>
      
      {currentPedidosFiltrados.length > 0 ? (
        <div className="space-y-4 md:space-y-6">
          {currentPedidosFiltrados
            .sort((a, b) => new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime())
            .map((pedido) => (
              <PedidoAdminCard 
                key={pedido.id} 
                pedido={pedido} 
                clientes={clientes}
                atualizarStatus={atualizarStatusPedido}
                imprimirPedido={handleImprimirPedido}
                onShowClienteDetails={handleShowClienteDetails}
              />
            ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 md:p-8 text-center">
          <Info className="mx-auto h-8 w-8 md:h-10 md:w-10 text-gray-400 mb-2 md:mb-4" />
          <p className="text-base md:text-lg font-medium">Nenhum pedido encontrado</p>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Não há pedidos {statusOptions.find(o => o.value === filtroStatus)?.label.toLowerCase()} no momento
          </p>
        </div>
      )}
      
      <ClienteDetailsDialog 
        open={clienteDialogOpen}
        onOpenChange={setClienteDialogOpen}
        cliente={selectedCliente}
      />
    </>
  );
}
