
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface FinancialMetricsCardsProps {
  valoresCompletos: number;
  valoresCancelados: number;
  valorTotal: number;
}

export default function FinancialMetricsCards({ 
  valoresCompletos, 
  valoresCancelados, 
  valorTotal 
}: FinancialMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      <Card className="powerbi-metric-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Faturamento Total
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Valor concluído</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-accent">
            R$ {valoresCompletos.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="powerbi-metric-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            Perda de Faturamento
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Pedidos cancelados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-destructive">
            R$ {valoresCancelados.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="powerbi-metric-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Taxa de Conversão
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Concluídos vs. Cancelados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold powerbi-title">
            {valorTotal > 0 
              ? `${Math.round((valoresCompletos / valorTotal) * 100)}%` 
              : "0%"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
