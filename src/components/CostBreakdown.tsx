import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign } from "lucide-react";

interface Cluster {
  id: string;
  name: string;
  provider: 'aws' | 'gcp' | 'azure';
  region: string;
  status: 'healthy' | 'warning' | 'critical';
  nodes: number;
  pods: number;
  cost: number;
  cpu: number;
  memory: number;
}

interface CostBreakdownProps {
  clusters: Cluster[];
}

export const CostBreakdown = ({ clusters }: CostBreakdownProps) => {
  const providerCosts = clusters.reduce((acc, cluster) => {
    acc[cluster.provider] = (acc[cluster.provider] || 0) + cluster.cost;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(providerCosts).map(([provider, cost]) => ({
    name: provider.toUpperCase(),
    value: cost,
    provider
  }));

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws':
        return 'hsl(var(--aws-orange))';
      case 'gcp':
        return 'hsl(var(--gcp-blue))';
      case 'azure':
        return 'hsl(var(--azure-blue))';
      default:
        return 'hsl(var(--k8s-primary))';
    }
  };

  const COLORS = data.map(item => getProviderColor(item.provider));

  return (
    <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-k8s-warning" />
          Cost by Cloud Provider
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
            />
            <Legend 
              wrapperStyle={{
                color: 'hsl(var(--foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};