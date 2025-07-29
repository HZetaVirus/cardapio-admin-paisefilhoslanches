
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from "lucide-react";

interface DistributionPieChartProps {
  dadosPizza: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function DistributionPieChart({ dadosPizza }: DistributionPieChartProps) {
  return (
    <Card className="powerbi-card">
      <CardHeader className="powerbi-card-header">
        <CardTitle className="text-base sm:text-lg md:text-xl powerbi-title flex items-center gap-2">
          <PieChartIcon className="h-4 w-4" />
          Distribuição
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Faturamento vs Perda</CardDescription>
      </CardHeader>
      <CardContent className="powerbi-card-content h-[300px] sm:h-[350px] p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={dadosPizza}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              fontSize={10}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {dadosPizza.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
              contentStyle={{ 
                fontSize: '12px',
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
