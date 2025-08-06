import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Network, Filter, Eye } from "lucide-react";

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

interface Pod {
  id: string;
  name: string;
  namespace: string;
  status: 'running' | 'pending' | 'failed';
  clusterId: string;
  cpu: number;
  memory: number;
}

interface PodVisualizationProps {
  clusters: Cluster[];
}

// Mock pod data
const generateMockPods = (clusters: Cluster[]): Pod[] => {
  const pods: Pod[] = [];
  const namespaces = ['default', 'kube-system', 'monitoring', 'ingress', 'app'];
  const statuses: Pod['status'][] = ['running', 'running', 'running', 'running', 'pending', 'failed'];
  
  clusters.forEach(cluster => {
    const podCount = cluster.pods;
    for (let i = 0; i < podCount; i++) {
      pods.push({
        id: `${cluster.id}-pod-${i}`,
        name: `pod-${i}-${Math.random().toString(36).substr(2, 5)}`,
        namespace: namespaces[Math.floor(Math.random() * namespaces.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        clusterId: cluster.id,
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100)
      });
    }
  });
  
  return pods;
};

export const PodVisualization = ({ clusters }: PodVisualizationProps) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [pods] = useState(generateMockPods(clusters));

  const filteredPods = pods.filter(pod => {
    if (selectedCluster !== 'all' && pod.clusterId !== selectedCluster) return false;
    if (selectedNamespace !== 'all' && pod.namespace !== selectedNamespace) return false;
    return true;
  });

  const namespaces = Array.from(new Set(pods.map(pod => pod.namespace)));

  const getStatusColor = (status: Pod['status']) => {
    switch (status) {
      case 'running':
        return 'bg-k8s-success';
      case 'pending':
        return 'bg-k8s-warning';
      case 'failed':
        return 'bg-k8s-danger';
    }
  };

  const getClusterInfo = (clusterId: string) => {
    return clusters.find(c => c.id === clusterId);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-k8s-secondary" />
            Pod Visualization
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCluster} onValueChange={setSelectedCluster}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select cluster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clusters</SelectItem>
                {clusters.map(cluster => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select namespace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Namespaces</SelectItem>
                {namespaces.map(namespace => (
                  <SelectItem key={namespace} value={namespace}>
                    {namespace}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pod Grid Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredPods.slice(0, 50).map(pod => {
              const cluster = getClusterInfo(pod.clusterId);
              return (
                <div
                  key={pod.id}
                  className="p-3 rounded-lg border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {pod.name}
                    </span>
                    <div 
                      className={`w-3 h-3 rounded-full ${getStatusColor(pod.status)}`}
                      title={pod.status}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Namespace:</span>
                      <Badge variant="outline" className="text-xs">
                        {pod.namespace}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Cluster:</span>
                      <span className="text-foreground">{cluster?.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">CPU:</span>
                      <span className="text-foreground">{pod.cpu}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Memory:</span>
                      <span className="text-foreground">{pod.memory}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-accent/20">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Showing {Math.min(filteredPods.length, 50)} of {filteredPods.length} pods
              </span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-k8s-success"></div>
                <span className="text-muted-foreground">Running: {filteredPods.filter(p => p.status === 'running').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-k8s-warning"></div>
                <span className="text-muted-foreground">Pending: {filteredPods.filter(p => p.status === 'pending').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-k8s-danger"></div>
                <span className="text-muted-foreground">Failed: {filteredPods.filter(p => p.status === 'failed').length}</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};