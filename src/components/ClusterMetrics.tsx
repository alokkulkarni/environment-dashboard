import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from "lucide-react";

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

interface ClusterMetricsProps {
  clusters: Cluster[];
}

export const ClusterMetrics = ({ clusters }: ClusterMetricsProps) => {
  const data = clusters.map(cluster => ({
    name: cluster.name,
    cpu: cluster.cpu,
    memory: cluster.memory,
    pods: cluster.pods
  }));

  return (
    <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-k8s-primary" />
          Cluster Resource Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Bar 
              dataKey="cpu" 
              fill="hsl(var(--k8s-primary))" 
              name="CPU %" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="memory" 
              fill="hsl(var(--k8s-secondary))" 
              name="Memory %" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};