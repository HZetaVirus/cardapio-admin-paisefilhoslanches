
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3 } from "lucide-react";

interface DailyRevenueChartProps {
  dadosPorDia: Array<{
    dia: string;
    concluídos: number;
    cancelados: number;
  }>;
}

export default function DailyRevenueChart({ dadosPorDia }: DailyRevenueChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2 powerbi-card">
      <CardHeader className="powerbi-card-header">
        <CardTitle className="text-base sm:text-lg md:text-xl powerbi-title flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Faturamento por Dia
        </CardTitle>
      </CardHeader>
      <CardContent className="powerbi-card-content h-[300px] sm:h-[350px] p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={dadosPorDia}
            margin={{ 
              top: 20, 
              right: 10, 
              left: 10, 
              bottom: 40 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="dia" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              width={50}
              stroke="hsl(var(--border))"
            />
            <Tooltip 
              formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
              labelFormatter={(label) => `Dia: ${label}`}
              contentStyle={{ 
                fontSize: '12px',
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            />
            <Bar 
              dataKey="concluídos" 
              name="Faturamento" 
              fill="hsl(168, 76%, 42%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="cancelados" 
              name="Perda" 
              fill="hsl(0, 84%, 60%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
