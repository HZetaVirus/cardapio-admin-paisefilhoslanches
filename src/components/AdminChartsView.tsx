
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useChartsData } from "@/hooks/useChartsData";
import FinancialMetricsCards from "./admin/charts/FinancialMetricsCards";
import DailyRevenueChart from "./admin/charts/DailyRevenueChart";
import DistributionPieChart from "./admin/charts/DistributionPieChart";
import OrderStatusChart from "./admin/charts/OrderStatusChart";

export default function AdminChartsView() {
  const {
    valoresCompletos,
    valoresCancelados,
    valorTotal,
    dadosPorDia,
    dadosPizza,
    dadosPorStatus
  } = useChartsData();
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="powerbi-card">
        <CardHeader className="powerbi-card-header">
          <CardTitle className="flex items-center gap-3 powerbi-title text-xl md:text-2xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Análise Financeira
          </CardTitle>
        </CardHeader>
      </div>
      
      <FinancialMetricsCards 
        valoresCompletos={valoresCompletos}
        valoresCancelados={valoresCancelados}
        valorTotal={valorTotal}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <DailyRevenueChart dadosPorDia={dadosPorDia} />
        
        <DistributionPieChart dadosPizza={dadosPizza} />
        
        <OrderStatusChart dadosPorStatus={dadosPorStatus} />
      </div>
    </div>
  );
}
