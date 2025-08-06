import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Activity, Loader2 } from "lucide-react";

interface ScaleWorkloadModalProps {
  trigger: React.ReactNode;
}

interface ScaleForm {
  cluster: string;
  namespace: string;
  workload: string;
  workloadType: 'deployment' | 'statefulset' | 'daemonset';
  currentReplicas: number;
  targetReplicas: number;
}

const clusters = [
  { id: '1', name: 'prod-us-east', provider: 'aws' },
  { id: '2', name: 'staging-eu', provider: 'gcp' },
  { id: '3', name: 'dev-azure', provider: 'azure' }
];

const mockWorkloads = {
  '1': [
    { name: 'frontend-deployment', type: 'deployment', namespace: 'production', replicas: 3 },
    { name: 'api-gateway', type: 'deployment', namespace: 'production', replicas: 2 },
    { name: 'database-statefulset', type: 'statefulset', namespace: 'production', replicas: 1 }
  ],
  '2': [
    { name: 'staging-app', type: 'deployment', namespace: 'staging', replicas: 1 },
    { name: 'staging-worker', type: 'deployment', namespace: 'staging', replicas: 2 }
  ],
  '3': [
    { name: 'dev-app', type: 'deployment', namespace: 'development', replicas: 1 }
  ]
};

export const ScaleWorkloadModal = ({ trigger }: ScaleWorkloadModalProps) => {
  const [open, setOpen] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const { toast } = useToast();
  
  const [form, setForm] = useState<ScaleForm>({
    cluster: '',
    namespace: '',
    workload: '',
    workloadType: 'deployment',
    currentReplicas: 1,
    targetReplicas: 1
  });

  const availableWorkloads = form.cluster ? (mockWorkloads[form.cluster as keyof typeof mockWorkloads] || []) : [];
  const selectedWorkload = availableWorkloads.find(w => w.name === form.workload);

  const handleClusterChange = (clusterId: string) => {
    setForm(prev => ({
      ...prev,
      cluster: clusterId,
      namespace: '',
      workload: '',
      currentReplicas: 1,
      targetReplicas: 1
    }));
  };

  const handleWorkloadChange = (workloadName: string) => {
    const workload = availableWorkloads.find(w => w.name === workloadName);
    if (workload) {
      setForm(prev => ({
        ...prev,
        workload: workloadName,
        namespace: workload.namespace,
        workloadType: workload.type as 'deployment' | 'statefulset' | 'daemonset',
        currentReplicas: workload.replicas,
        targetReplicas: workload.replicas
      }));
    }
  };

  const handleScale = async () => {
    setIsScaling(true);
    
    // Simulate scaling process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const action = form.targetReplicas > form.currentReplicas ? 'scaled up' : 'scaled down';
    
    toast({
      title: "Workload Scaled",
      description: `${form.workload} has been ${action} from ${form.currentReplicas} to ${form.targetReplicas} replicas`,
    });
    
    setIsScaling(false);
    setOpen(false);
    
    // Reset form
    setForm({
      cluster: '',
      namespace: '',
      workload: '',
      workloadType: 'deployment',
      currentReplicas: 1,
      targetReplicas: 1
    });
  };

  const isFormValid = form.cluster && form.workload && form.targetReplicas !== form.currentReplicas;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-k8s-primary" />
            Scale Workload
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="cluster">Target Cluster*</Label>
            <Select value={form.cluster} onValueChange={handleClusterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a cluster" />
              </SelectTrigger>
              <SelectContent>
                {clusters.map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    {cluster.name} ({cluster.provider.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.cluster && (
            <div className="space-y-2">
              <Label htmlFor="workload">Workload*</Label>
              <Select value={form.workload} onValueChange={handleWorkloadChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a workload" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkloads.map((workload) => (
                    <SelectItem key={workload.name} value={workload.name}>
                      {workload.name} ({workload.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedWorkload && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Namespace</Label>
                  <Input value={form.namespace} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={form.workloadType} disabled />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Replicas</Label>
                  <div className="text-sm text-muted-foreground">
                    {form.currentReplicas} → {form.targetReplicas}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current: {form.currentReplicas}</span>
                    <span className="text-muted-foreground">Target: {form.targetReplicas}</span>
                  </div>
                  
                  <Slider
                    value={[form.targetReplicas]}
                    onValueChange={(value) => setForm(prev => ({ ...prev, targetReplicas: value[0] }))}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>20</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="targetInput" className="text-sm">Target Replicas:</Label>
                  <Input
                    id="targetInput"
                    type="number"
                    min="0"
                    max="20"
                    value={form.targetReplicas}
                    onChange={(e) => setForm(prev => ({ ...prev, targetReplicas: parseInt(e.target.value) || 0 }))}
                    className="w-20"
                  />
                </div>
              </div>

              {form.targetReplicas === 0 && (
                <div className="p-3 rounded-lg bg-k8s-warning/10 border border-k8s-warning/20">
                  <p className="text-sm text-k8s-warning">
                    ⚠️ Setting replicas to 0 will stop all pods for this workload
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleScale} 
            disabled={!isFormValid || isScaling}
            className="bg-gradient-to-r from-k8s-primary to-k8s-secondary hover:opacity-90"
          >
            {isScaling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scaling...
              </>
            ) : (
              'Scale Workload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};