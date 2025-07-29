
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminTabsNavigationProps {
  currentTab: string;
}

export default function AdminTabsNavigation({ currentTab }: AdminTabsNavigationProps) {
  return (
    <TabsList className="w-full md:w-auto mb-4 overflow-x-auto flex md:inline-flex gap-2">
      <TabsTrigger value="pedidos" className="flex-1 md:flex-auto px-3 flex items-center justify-center" title="Pedidos">
        <span className="text-xl">🛍️</span>
      </TabsTrigger>
      <TabsTrigger value="produtos" className="flex-1 md:flex-auto px-3 flex items-center justify-center" title="Produtos">
        <span className="text-xl">🍔</span>
      </TabsTrigger>
      <TabsTrigger value="clientes" className="flex-1 md:flex-auto px-3 flex items-center justify-center" title="Clientes">
        <span className="text-xl">👥</span>
      </TabsTrigger>
      <TabsTrigger value="financeiro" className="flex-1 md:flex-auto px-3 flex items-center justify-center" title="Financeiro">
        <span className="text-xl">💰</span>
      </TabsTrigger>
      <TabsTrigger value="entrega" className="flex-1 md:flex-auto px-3 flex items-center justify-center" title="Entrega">
        <span className="text-xl">🚚</span>
      </TabsTrigger>
      <TabsTrigger value="configuracoes" className="flex-1 md:flex-auto px-3 flex items-center justify-center" title="Configurações">
        <span className="text-xl">⚙️</span>
      </TabsTrigger>
    </TabsList>
  );
}
