import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Server, Loader2 } from "lucide-react";

interface DeployAppModalProps {
  trigger: React.ReactNode;
}

interface DeploymentForm {
  appName: string;
  image: string;
  replicas: number;
  namespace: string;
  port: string;
  cpu: string;
  memory: string;
  cluster: string;
  envVars: string;
}

const clusters = [
  { id: '1', name: 'prod-us-east', provider: 'aws' },
  { id: '2', name: 'staging-eu', provider: 'gcp' },
  { id: '3', name: 'dev-azure', provider: 'azure' }
];

export const DeployAppModal = ({ trigger }: DeployAppModalProps) => {
  const [open, setOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  
  const [form, setForm] = useState<DeploymentForm>({
    appName: '',
    image: '',
    replicas: 1,
    namespace: 'default',
    port: '',
    cpu: '100m',
    memory: '128Mi',
    cluster: '',
    envVars: ''
  });

  const handleInputChange = (field: keyof DeploymentForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Application Deployed",
      description: `${form.appName} has been successfully deployed to ${clusters.find(c => c.id === form.cluster)?.name || 'cluster'}`,
    });
    
    setIsDeploying(false);
    setOpen(false);
    
    // Reset form
    setForm({
      appName: '',
      image: '',
      replicas: 1,
      namespace: 'default',
      port: '',
      cpu: '100m',
      memory: '128Mi',
      cluster: '',
      envVars: ''
    });
  };

  const isFormValid = form.appName && form.image && form.cluster;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-k8s-primary" />
            Deploy Application
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Application Name*</Label>
              <Input
                id="appName"
                placeholder="my-app"
                value={form.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Container Image*</Label>
              <Input
                id="image"
                placeholder="nginx:latest"
                value={form.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="replicas">Replicas</Label>
              <Input
                id="replicas"
                type="number"
                min="1"
                max="20"
                value={form.replicas}
                onChange={(e) => handleInputChange('replicas', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="namespace">Namespace</Label>
              <Input
                id="namespace"
                placeholder="default"
                value={form.namespace}
                onChange={(e) => handleInputChange('namespace', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="80"
                value={form.port}
                onChange={(e) => handleInputChange('port', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpu">CPU Request</Label>
              <Input
                id="cpu"
                placeholder="100m"
                value={form.cpu}
                onChange={(e) => handleInputChange('cpu', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memory">Memory Request</Label>
              <Input
                id="memory"
                placeholder="128Mi"
                value={form.memory}
                onChange={(e) => handleInputChange('memory', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cluster">Target Cluster*</Label>
            <Select value={form.cluster} onValueChange={(value) => handleInputChange('cluster', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="envVars">Environment Variables (Optional)</Label>
            <Textarea
              id="envVars"
              placeholder="KEY1=value1&#10;KEY2=value2"
              value={form.envVars}
              onChange={(e) => handleInputChange('envVars', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeploy} 
            disabled={!isFormValid || isDeploying}
            className="bg-gradient-to-r from-k8s-primary to-k8s-secondary hover:opacity-90"
          >
            {isDeploying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              'Deploy Application'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};