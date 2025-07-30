
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminTabsNavigationProps {
  currentTab: string;
}

export default function AdminTabsNavigation({ currentTab }: AdminTabsNavigationProps) {
  return (
    <TabsList className="w-full md:w-auto mb-4 overflow-x-auto flex md:inline-flex gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <TabsTrigger value="pedidos" className="flex-1 md:flex-auto px-3 flex items-center justify-center data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 hover:bg-gray-100 dark:hover:bg-gray-700" title="Pedidos">
        <span className="text-xl">🛍️</span>
      </TabsTrigger>
      <TabsTrigger value="produtos" className="flex-1 md:flex-auto px-3 flex items-center justify-center data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 hover:bg-gray-100 dark:hover:bg-gray-700" title="Produtos">
        <span className="text-xl">🍔</span>
      </TabsTrigger>
      <TabsTrigger value="clientes" className="flex-1 md:flex-auto px-3 flex items-center justify-center data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 hover:bg-gray-100 dark:hover:bg-gray-700" title="Clientes">
        <span className="text-xl">👥</span>
      </TabsTrigger>
      <TabsTrigger value="financeiro" className="flex-1 md:flex-auto px-3 flex items-center justify-center data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 hover:bg-gray-100 dark:hover:bg-gray-700" title="Financeiro">
        <span className="text-xl">💰</span>
      </TabsTrigger>
      <TabsTrigger value="entrega" className="flex-1 md:flex-auto px-3 flex items-center justify-center data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 hover:bg-gray-100 dark:hover:bg-gray-700" title="Entrega">
        <span className="text-xl">🚚</span>
      </TabsTrigger>
      <TabsTrigger value="configuracoes" className="flex-1 md:flex-auto px-3 flex items-center justify-center data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 hover:bg-gray-100 dark:hover:bg-gray-700" title="Configurações">
        <span className="text-xl">⚙️</span>
      </TabsTrigger>
    </TabsList>
  );
}
