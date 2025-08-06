import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Server, 
  Activity, 
  Cpu,
  HardDrive,
  Network,
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Pod {
  id: string;
  name: string;
  namespace: string;
  status: 'running' | 'pending' | 'failed' | 'succeeded';
  node: string;
  cpu: number;
  memory: number;
  restarts: number;
  age: string;
  applications: Application[];
}

interface Application {
  name: string;
  image: string;
  ports: number[];
  resources: {
    cpu: string;
    memory: string;
  };
}

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

const mockClusters: Cluster[] = [
  {
    id: '1',
    name: 'prod-us-east',
    provider: 'aws',
    region: 'us-east-1',
    status: 'healthy',
    nodes: 12,
    pods: 245,
    cost: 1240.50,
    cpu: 68,
    memory: 72
  },
  {
    id: '2',
    name: 'staging-eu',
    provider: 'gcp',
    region: 'europe-west1',
    status: 'warning',
    nodes: 6,
    pods: 89,
    cost: 540.25,
    cpu: 45,
    memory: 62
  },
  {
    id: '3',
    name: 'dev-azure',
    provider: 'azure',
    region: 'westus2',
    status: 'healthy',
    nodes: 4,
    pods: 42,
    cost: 280.75,
    cpu: 32,
    memory: 41
  }
];

const mockPods: { [clusterId: string]: Pod[] } = {
  '1': [
    {
      id: 'pod-1',
      name: 'frontend-deployment-abc123',
      namespace: 'production',
      status: 'running',
      node: 'node-1',
      cpu: 45,
      memory: 67,
      restarts: 0,
      age: '3d',
      applications: [
        {
          name: 'frontend-app',
          image: 'nginx:1.21',
          ports: [80, 443],
          resources: { cpu: '100m', memory: '128Mi' }
        }
      ]
    },
    {
      id: 'pod-2',
      name: 'api-gateway-def456',
      namespace: 'production',
      status: 'running',
      node: 'node-2',
      cpu: 78,
      memory: 85,
      restarts: 1,
      age: '2d',
      applications: [
        {
          name: 'api-gateway',
          image: 'kong:2.8',
          ports: [8000, 8443],
          resources: { cpu: '200m', memory: '256Mi' }
        }
      ]
    },
    {
      id: 'pod-3',
      name: 'database-ghi789',
      namespace: 'production',
      status: 'running',
      node: 'node-3',
      cpu: 92,
      memory: 78,
      restarts: 0,
      age: '5d',
      applications: [
        {
          name: 'postgresql',
          image: 'postgres:14',
          ports: [5432],
          resources: { cpu: '500m', memory: '1Gi' }
        }
      ]
    },
    {
      id: 'pod-4',
      name: 'worker-jkl012',
      namespace: 'production',
      status: 'pending',
      node: 'node-1',
      cpu: 0,
      memory: 0,
      restarts: 0,
      age: '1m',
      applications: [
        {
          name: 'background-worker',
          image: 'worker:latest',
          ports: [],
          resources: { cpu: '100m', memory: '64Mi' }
        }
      ]
    }
  ],
  '2': [
    {
      id: 'pod-5',
      name: 'staging-app-mno345',
      namespace: 'staging',
      status: 'running',
      node: 'node-1',
      cpu: 34,
      memory: 45,
      restarts: 2,
      age: '1d',
      applications: [
        {
          name: 'staging-app',
          image: 'app:staging',
          ports: [3000],
          resources: { cpu: '150m', memory: '192Mi' }
        }
      ]
    }
  ],
  '3': [
    {
      id: 'pod-6',
      name: 'dev-test-pqr678',
      namespace: 'development',
      status: 'running',
      node: 'node-1',
      cpu: 12,
      memory: 28,
      restarts: 0,
      age: '4h',
      applications: [
        {
          name: 'test-app',
          image: 'app:dev',
          ports: [8080],
          resources: { cpu: '50m', memory: '64Mi' }
        }
      ]
    }
  ]
};

const performanceData = [
  { time: '00:00', cpu: 45, memory: 67, network: 23 },
  { time: '04:00', cpu: 52, memory: 71, network: 28 },
  { time: '08:00', cpu: 78, memory: 85, network: 45 },
  { time: '12:00', cpu: 67, memory: 78, network: 38 },
  { time: '16:00', cpu: 55, memory: 82, network: 42 },
  { time: '20:00', cpu: 48, memory: 75, network: 35 },
  { time: '24:00', cpu: 41, memory: 69, network: 29 }
];

const getStatusIcon = (status: Pod['status']) => {
  switch (status) {
    case 'running':
      return <CheckCircle className="h-4 w-4 text-k8s-success" />;
    case 'pending':
      return <AlertTriangle className="h-4 w-4 text-k8s-warning" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-k8s-danger" />;
    case 'succeeded':
      return <CheckCircle className="h-4 w-4 text-k8s-info" />;
  }
};

const getStatusColor = (status: Pod['status']) => {
  switch (status) {
    case 'running':
      return 'bg-k8s-success text-foreground';
    case 'pending':
      return 'bg-k8s-warning text-foreground';
    case 'failed':
      return 'bg-k8s-danger text-foreground';
    case 'succeeded':
      return 'bg-k8s-info text-foreground';
  }
};

const COLORS = ['hsl(var(--k8s-primary))', 'hsl(var(--k8s-secondary))', 'hsl(var(--k8s-accent))', 'hsl(var(--k8s-info))'];

export const ClusterDetails = () => {
  const { clusterId } = useParams();
  const navigate = useNavigate();
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);

  const cluster = mockClusters.find(c => c.id === clusterId);
  const pods = mockPods[clusterId || ''] || [];

  if (!cluster) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Cluster not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const podStatusCounts = pods.reduce((acc, pod) => {
    acc[pod.status] = (acc[pod.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(podStatusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="bg-accent/10 border-accent/20 hover:bg-accent/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-k8s-primary to-k8s-secondary bg-clip-text text-transparent">
              {cluster.name}
            </h1>
            <p className="text-muted-foreground">{cluster.provider.toUpperCase()} • {cluster.region}</p>
          </div>
        </div>
        <Badge className={`${cluster.provider === 'aws' ? 'bg-cloud-aws' : cluster.provider === 'gcp' ? 'bg-cloud-gcp' : 'bg-cloud-azure'} text-foreground`}>
          {cluster.provider.toUpperCase()}
        </Badge>
      </div>

      {/* Cluster Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pods.length}</div>
            <p className="text-xs text-k8s-success">{pods.filter(p => p.status === 'running').length} running</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{cluster.cpu}%</div>
            <Progress value={cluster.cpu} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Memory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{cluster.memory}%</div>
            <Progress value={cluster.memory} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-k8s-success">${cluster.cost}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-card to-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-k8s-primary" />
              Performance Metrics (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stackId="1" 
                  stroke="hsl(var(--k8s-primary))" 
                  fill="hsl(var(--k8s-primary))" 
                  fillOpacity={0.3}
                  name="CPU %"
                />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stackId="2" 
                  stroke="hsl(var(--k8s-secondary))" 
                  fill="hsl(var(--k8s-secondary))" 
                  fillOpacity={0.3}
                  name="Memory %"
                />
                <Area 
                  type="monotone" 
                  dataKey="network" 
                  stackId="3" 
                  stroke="hsl(var(--k8s-accent))" 
                  fill="hsl(var(--k8s-accent))" 
                  fillOpacity={0.3}
                  name="Network %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-k8s-primary" />
              Pod Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground capitalize">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pod List */}
      <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-k8s-primary" />
            Pod Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pods.map((pod) => (
              <div
                key={pod.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPod?.id === pod.id 
                    ? 'bg-accent/20 border-k8s-primary' 
                    : 'bg-accent/10 border-accent/20 hover:bg-accent/15'
                }`}
                onClick={() => setSelectedPod(selectedPod?.id === pod.id ? null : pod)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pod.status)}
                      <span className="font-semibold text-foreground">{pod.name}</span>
                    </div>
                    <Badge className={getStatusColor(pod.status)}>
                      {pod.status}
                    </Badge>
                    <Badge variant="outline" className="border-accent/30">
                      {pod.namespace}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Cpu className="h-4 w-4 text-k8s-info" />
                      <span className="text-muted-foreground">CPU:</span>
                      <span className="text-foreground">{pod.cpu}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="h-4 w-4 text-k8s-warning" />
                      <span className="text-muted-foreground">Memory:</span>
                      <span className="text-foreground">{pod.memory}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <RotateCcw className="h-4 w-4 text-k8s-secondary" />
                      <span className="text-muted-foreground">Restarts:</span>
                      <span className="text-foreground">{pod.restarts}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Age: {pod.age}
                    </div>
                  </div>
                </div>

                {selectedPod?.id === pod.id && (
                  <div className="mt-4 pt-4 border-t border-accent/20">
                    <h4 className="font-semibold text-foreground mb-3">Applications Running</h4>
                    <div className="space-y-3">
                      {pod.applications.map((app, index) => (
                        <div key={index} className="bg-background/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{app.name}</span>
                            <Badge variant="outline" className="border-accent/30">
                              {app.image}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Ports:</span>
                              <span className="ml-2 text-foreground">
                                {app.ports.length > 0 ? app.ports.join(' ') : 'None'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">CPU:</span>
                              <span className="ml-2 text-foreground">{app.resources.cpu}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Memory:</span>
                              <span className="ml-2 text-foreground">{app.resources.memory}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};