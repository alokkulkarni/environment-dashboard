import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Cloud, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Cpu,
  HardDrive,
  Network
} from "lucide-react";
import { ClusterMetrics } from "./ClusterMetrics";
import { CostBreakdown } from "./CostBreakdown";
import { PodVisualization } from "./PodVisualization";
import { useNavigate } from "react-router-dom";
import { DeployAppModal } from "./DeployAppModal";
import { ScaleWorkloadModal } from "./ScaleWorkloadModal";

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

const getStatusIcon = (status: Cluster['status']) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4 text-k8s-success" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-k8s-warning" />;
    case 'critical':
      return <XCircle className="h-4 w-4 text-k8s-danger" />;
  }
};

const getProviderColor = (provider: Cluster['provider']) => {
  switch (provider) {
    case 'aws':
      return 'bg-cloud-aws text-foreground';
    case 'gcp':
      return 'bg-cloud-gcp text-foreground';
    case 'azure':
      return 'bg-cloud-azure text-foreground';
  }
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const totalCost = mockClusters.reduce((sum, cluster) => sum + cluster.cost, 0);
  const totalNodes = mockClusters.reduce((sum, cluster) => sum + cluster.nodes, 0);
  const totalPods = mockClusters.reduce((sum, cluster) => sum + cluster.pods, 0);
  const healthyClusters = mockClusters.filter(c => c.status === 'healthy').length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-k8s-primary to-k8s-secondary bg-clip-text text-transparent">
            Kubernetes Dashboard
          </h1>
          <p className="text-muted-foreground">Multi-cloud cluster management and monitoring</p>
        </div>
        <Button className="bg-gradient-to-r from-k8s-primary to-k8s-secondary hover:opacity-90 transition-opacity">
          Add Cluster
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-k8s-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-k8s-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clusters</CardTitle>
            <Cloud className="h-4 w-4 text-k8s-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockClusters.length}</div>
            <p className="text-xs text-k8s-success">{healthyClusters} healthy</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nodes</CardTitle>
            <Server className="h-4 w-4 text-k8s-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalNodes}</div>
            <p className="text-xs text-muted-foreground">Across all clusters</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pods</CardTitle>
            <Activity className="h-4 w-4 text-k8s-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalPods}</div>
            <p className="text-xs text-muted-foreground">Running workloads</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cluster List */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-card to-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-k8s-primary" />
              Cluster Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockClusters.map((cluster) => (
              <div
                key={cluster.id}
                className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => navigate(`/cluster/${cluster.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(cluster.status)}
                    <span className="font-semibold text-foreground">{cluster.name}</span>
                  </div>
                  <Badge className={getProviderColor(cluster.provider)}>
                    {cluster.provider.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{cluster.region}</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Cpu className="h-4 w-4 text-k8s-info" />
                    <span className="text-muted-foreground">CPU:</span>
                    <span className="text-foreground">{cluster.cpu}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-k8s-warning" />
                    <span className="text-muted-foreground">Memory:</span>
                    <span className="text-foreground">{cluster.memory}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Network className="h-4 w-4 text-k8s-secondary" />
                    <span className="text-muted-foreground">Pods:</span>
                    <span className="text-foreground">{cluster.pods}</span>
                  </div>
                  <div className="text-sm font-semibold text-k8s-success">
                    ${cluster.cost.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DeployAppModal
              trigger={
                <Button variant="outline" className="w-full justify-start">
                  <Server className="h-4 w-4 mr-2" />
                  Deploy Application
                </Button>
              }
            />
            <ScaleWorkloadModal
              trigger={
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Scale Workload
                </Button>
              }
            />
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Alerts
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Cost Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClusterMetrics clusters={mockClusters} />
        <CostBreakdown clusters={mockClusters} />
      </div>

      {/* Pod Visualization */}
      <PodVisualization clusters={mockClusters} />
    </div>
  );
};