
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Cliente {
  id: number;
  nome_completo: string;
  telefone: string;
  endereco: string;
  data_ultimo_pedido?: string;
}

interface ClienteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
}

export default function ClienteDetailsDialog({ 
  open, 
  onOpenChange, 
  cliente 
}: ClienteDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Informações do Cliente</DialogTitle>
          <DialogDescription>
            Detalhes completos do cliente
          </DialogDescription>
        </DialogHeader>
        {cliente && (
          <div className="space-y-4 text-sm md:text-base">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Nome:</div>
              <div className="col-span-2">{cliente.nome_completo}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Telefone:</div>
              <div className="col-span-2">{cliente.telefone}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Endereço:</div>
              <div className="col-span-2">{cliente.endereco}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Última compra:</div>
              <div className="col-span-2">
                {cliente.data_ultimo_pedido 
                  ? new Date(cliente.data_ultimo_pedido).toLocaleString('pt-BR')
                  : 'Nenhuma compra anterior'}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
