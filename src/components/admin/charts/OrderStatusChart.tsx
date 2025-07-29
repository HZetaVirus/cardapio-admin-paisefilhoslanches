
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BarChart3 } from "lucide-react";

interface OrderStatusChartProps {
  dadosPorStatus: Array<{
    name: string;
    quantidade: number;
  }>;
}

export default function OrderStatusChart({ dadosPorStatus }: OrderStatusChartProps) {
  return (
    <Card className="powerbi-card">
      <CardHeader className="powerbi-card-header">
        <CardTitle className="text-base sm:text-lg md:text-xl powerbi-title flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Pedidos por Status
        </CardTitle>
      </CardHeader>
      <CardContent className="powerbi-card-content h-[300px] sm:h-[350px] p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={dadosPorStatus}
            layout="vertical"
            margin={{ 
              top: 10, 
              right: 10, 
              left: 60, 
              bottom: 10 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              type="number" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              width={55}
              stroke="hsl(var(--border))"
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: '12px',
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="quantidade" 
              fill="hsl(45, 96%, 53%)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
