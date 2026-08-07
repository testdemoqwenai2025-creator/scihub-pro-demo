'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore, createDynamicField } from '@/store/useDynamicStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComputeSkeleton, CardSkeleton } from '@/components/SkeletonComponents';

// ============ TYPES ============

interface ComputeJob {
  id: string;
  name: string;
  type: 'analysis' | 'training' | 'simulation' | 'pipeline' | 'custom';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'configuring';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submitter: string;
  progress: number;
  computeHoursUsed: number;
  computeHoursTotal: number;
  gpusAllocated: number;
  memoryUsed: string;
  memoryTotal: string;
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  logs: LogEntry[];
  estimatedCost?: number;
}

interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  message: string;
}

interface ComputeNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  gpus: number;
  runningJobs: number;
}

// ============ INITIAL DATA ============

const INITIAL_JOBS: ComputeJob[] = [
  {
    id: 'job-001',
    name: 'GATK Variant Calling Pipeline',
    type: 'pipeline',
    status: 'running',
    priority: 'high',
    submitter: 'Dr. Smith',
    progress: 67,
    computeHoursUsed: 12.5,
    computeHoursTotal: 18.0,
    gpusAllocated: 1,
    memoryUsed: '24 GB',
    memoryTotal: '32 GB',
    submittedAt: new Date(Date.now() - 2 * 3600000),
    startedAt: new Date(Date.now() - 1.9 * 3600000),
    estimatedCost: 2.45,
    logs: [
      { timestamp: new Date(Date.now() - 7200000), level: 'INFO', message: 'Job submitted to queue' },
      { timestamp: new Date(Date.now() - 6840000), level: 'INFO', message: 'Allocating resources (1x GPU, 32GB RAM)' },
      { timestamp: new Date(Date.now() - 6800000), level: 'INFO', message: 'Starting BWA alignment step...' },
      { timestamp: new Date(Date.now() - 3600000), level: 'INFO', message: 'BWA alignment complete. Starting MarkDuplicates...' },
      { timestamp: new Date(Date.now() - 1800000), level: 'INFO', message: 'Running HaplotypeCaller on chr1-22...' },
      { timestamp: new Date(Date.now() - 60000), level: 'INFO', message: 'Processing chromosome 17 of 22 (67%)' },
    ],
  },
  {
    id: 'job-002',
    name: 'Protein Folding Simulation (AlphaFold)',
    type: 'simulation',
    status: 'running',
    priority: 'urgent',
    submitter: 'Prof. Johnson',
    progress: 45,
    computeHoursUsed: 28.3,
    computeHoursTotal: 64.0,
    gpusAllocated: 4,
    memoryUsed: '48 GB',
    memoryTotal: '64 GB',
    submittedAt: new Date(Date.now() - 4 * 3600000),
    startedAt: new Date(Date.now() - 3.8 * 3600000),
    estimatedCost: 12.80,
    logs: [
      { timestamp: new Date(Date.now() - 14400000), level: 'INFO', message: 'AlphaFold v2.3 initialized' },
      { timestamp: new Date(Date.now() - 14000000), level: 'INFO', message: 'Loading MSA database (UniRef90)' },
      { timestamp: new Date(Date.now() - 13600000), level: 'INFO', message: 'MSA search complete. Found 15,234 homologs' },
      { timestamp: new Date(Date.now() - 7200000), level: 'INFO', message: 'Building features for model 1/5...' },
      { timestamp: new Date(Date.now() - 3600000), level: 'INFO', message: 'Model 1 inference: 45% complete' },
    ],
  },
  {
    id: 'job-003',
    name: 'Drug Screening - EGFR Inhibitors',
    type: 'analysis',
    status: 'queued',
    priority: 'normal',
    submitter: 'Research Team A',
    progress: 0,
    computeHoursUsed: 0,
    computeHoursTotal: 8.0,
    gpusAllocated: 0,
    memoryUsed: '0 GB',
    memoryTotal: '16 GB',
    submittedAt: new Date(Date.now() - 30 * 60000),
    estimatedCost: 1.20,
    logs: [
      { timestamp: new Date(Date.now() - 1800000), level: 'INFO', message: 'Job queued. Waiting for GPU allocation.' },
    ],
  },
  {
    id: 'job-004',
    name: 'ML Model Training - Toxicity Prediction',
    type: 'training',
    status: 'completed',
    priority: 'normal',
    submitter: 'Data Science Lab',
    progress: 100,
    computeHoursUsed: 42.0,
    computeHoursTotal: 42.0,
    gpusAllocated: 2,
    memoryUsed: '0 GB',
    memoryTotal: '32 GB',
    submittedAt: new Date(Date.now() - 24 * 3600000),
    startedAt: new Date(Date.now() - 23.5 * 3600000),
    completedAt: new Date(Date.now() - 20 * 3600000),
    estimatedCost: 8.40,
    logs: [
      { timestamp: new Date(Date.now() - 86400000), level: 'INFO', message: 'Training started with 500K samples' },
      { timestamp: new Date(Date.now() - 72000000), level: 'INFO', message: 'Epoch 50/200 - Loss: 0.342 - Val Loss: 0.398' },
      { timestamp: new Date(Date.now() - 57600000), level: 'INFO', message: 'Epoch 100/200 - Loss: 0.189 - Val Loss: 0.245' },
      { timestamp: new Date(Date.now() - 43200000), level: 'INFO', message: 'Epoch 150/200 - Loss: 0.123 - Val Loss: 0.178' },
      { timestamp: new Date(Date.now() - 28800000), level: 'INFO', message: 'Training complete. Best val_loss: 0.165 at epoch 178' },
      { timestamp: new Date(Date.now() - 28790000), level: 'SUCCESS', message: 'Model saved to /models/toxicity_v2.pt' },
    ],
  },
];

const INITIAL_NODES: ComputeNode[] = [
  { id: 'node-1', name: 'GPU-Node-01', status: 'online', cpuUsage: 78, memoryUsage: 65, gpuUsage: 92, gpus: 4, runningJobs: 3 },
  { id: 'node-2', name: 'GPU-Node-02', status: 'online', cpuUsage: 45, memoryUsage: 52, gpuUsage: 78, gpus: 4, runningJobs: 2 },
  { id: 'node-3', name: 'CPU-Node-01', status: 'online', cpuUsage: 62, memoryUsage: 71, gpuUsage: 0, gpus: 0, runningJobs: 5 },
  { id: 'node-4', name: 'GPU-Node-03', status: 'maintenance', cpuUsage: 0, memoryUsage: 10, gpuUsage: 0, gpus: 4, runningJobs: 0 },
];

// ============ COMPUTE PAGE ============

export default function ComputePage() {
  const { t } = useTranslation();
  const {
    createJob,
    updateJobProgress,
    cancelJob,
    addActivity,
  } = useDynamicStore();

  // UI State
  const [jobs, setJobs] = useState<ComputeJob[]>(INITIAL_JOBS);
  const [nodes] = useState<ComputeNode[]>(INITIAL_NODES);
  const [selectedJob, setSelectedJob] = useState<ComputeJob | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [newJobName, setNewJobName] = useState('');
  const [newJobType, setNewJobType] = useState<ComputeJob['type']>('analysis');
  const [newJobPriority, setNewJobPriority] = useState<ComputeJob['priority']>('normal');
  const [newJobDataset, setNewJobDataset] = useState('');
  const [newJobGpus, setNewJobGpus] = useState(1);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-update running jobs
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === 'running') {
          const newProgress = Math.min(100, job.progress + Math.random() * 2);
          const newComputeHours = job.computeHoursUsed + (Math.random() * 0.1);
          
          return {
            ...job,
            progress: newProgress,
            computeHoursUsed: newComputeHours,
            ...(newProgress >= 100 ? { 
              status: 'completed' as const, 
              completedAt: new Date(),
              estimatedCost: job.estimatedCost ? job.estimatedCost + Math.random() * 0.5 : undefined
            } : {}),
          };
        }
        return job;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Stats calculations
  const activeJobs = jobs.filter(j => j.status === 'running');
  const totalCompute = jobs.reduce((acc, j) => acc + j.computeHoursUsed, 0);
  const totalGPUs = activeJobs.reduce((acc, j) => acc + j.gpusAllocated, 0);
  const avgProgress = activeJobs.length > 0 
    ? Math.round(activeJobs.reduce((acc, j) => acc + j.progress, 0) / activeJobs.length)
    : 0;

  // Handle job creation
  const handleCreateJob = () => {
    if (!newJobName.trim()) return;

    const costPerHour = newJobGpus * 0.5; // $0.50 per GPU hour (free tier simulation)
    const estimatedHours = newJobType === 'training' ? 24 : newJobType === 'simulation' ? 16 : 4;

    const newJob: ComputeJob = {
      id: `job-${Date.now()}`,
      name: newJobName,
      type: newJobType,
      status: 'queued',
      priority: newJobPriority,
      submitter: 'You',
      progress: 0,
      computeHoursUsed: 0,
      computeHoursTotal: estimatedHours,
      gpusAllocated: 0,
      memoryUsed: '0 GB',
      memoryTotal: `${newJobGpus * 16} GB`,
      submittedAt: new Date(),
      estimatedCost: estimatedHours * costPerHour,
      logs: [{ timestamp: new Date(), level: 'INFO', message: 'Job created and queued' }],
    };

    setJobs(prev => [newJob, ...prev]);
    
    // Also add to store
    createJob({
      name: createDynamicField(newJobName),
      type: createDynamicField(newJobType),
      status: createDynamicField('queued'),
      priority: createDynamicField(newJobPriority),
      submitter: createDynamicField('You'),
      config: {
        inputDataset: createDynamicField(newJobDataset),
        parameters: {},
        outputFormat: createDynamicField('JSON'),
        notifications: createDynamicField(true),
        retryCount: createDynamicField(3),
      },
      progress: createDynamicField(0),
      computeHoursUsed: createDynamicField(0),
      computeHoursTotal: createDynamicField(estimatedHours),
      gpusAllocated: createDynamicField(0),
      memoryUsed: createDynamicField('0 GB'),
    });

    addActivity({
      type: 'job',
      message: createDynamicField(`Submitted job "${newJobName}"`),
      icon: '⚡',
    });

    // Reset form
    setNewJobName('');
    setShowCreateForm(false);
  };

  // Handle job cancellation
  const handleCancelJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    if (confirm(`Cancel job "${job.name}"?`)) {
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'cancelled' as const } : j
      ));
      cancelJob(jobId);
      
      addActivity({
        type: 'update',
        message: createDynamicField(`Cancelled job "${job.name}"`),
        icon: '🛑',
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: ComputeJob['status']) => {
    switch (status) {
      case 'running': return <Badge className="bg-blue-500 animate-pulse">{t('compute.running') || 'Running'}</Badge>;
      case 'queued': return <Badge className="bg-yellow-500">{t('compute.queued') || 'Queued'}</Badge>;
      case 'completed': return <Badge className="bg-green-500">{t('compute.completed') || 'Completed'}</Badge>;
      case 'failed': return <Badge variant="destructive">{t('compute.failed') || 'Failed'}</Badge>;
      case 'cancelled': return <Badge variant="secondary">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: ComputeJob['priority']) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-400',
      normal: 'bg-blue-400',
      high: 'bg-orange-400',
      urgent: 'bg-red-500',
    };
    return <Badge className={colors[priority]}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
  };

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ComputeSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('compute.title') || 'Compute Layer'}</h1>
        <p className="text-muted-foreground mt-1">
          Manage computational jobs and monitor cluster resources. Free-tier simulation included.
        </p>
        
        <div className="mt-2 flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            🆓 Free Tier Compute
          </Badge>
          <span className="text-sm text-muted-foreground">
            Simulated resources • No actual costs incurred
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm text-muted-foreground">{t('compute.active_jobs') || 'Active Jobs'}</p>
              <p className="text-xl font-bold text-blue-500">{activeJobs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-sm text-muted-foreground">Total Compute Used</p>
              <p className="text-xl font-bold">{totalCompute.toFixed(1)} hrs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🖥️</span>
            <div>
              <p className="text-sm text-muted-foreground">GPUs Allocated</p>
              <p className="text-xl font-bold text-purple-500">{totalGPUs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
              <p className="text-xl font-bold text-green-500">{avgProgress}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Job Button */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('compute.jobs') || 'Jobs'}</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          + {t('compute.new_job') || 'New Job'}
        </Button>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="text-base">Submit New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Job Name *</label>
                <Input
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  placeholder="e.g., Variant Analysis Pipeline"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Job Type</label>
                <Select value={newJobType} onValueChange={(v) => setNewJobType(v as ComputeJob['type'])}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="simulation">Simulation</SelectItem>
                    <SelectItem value="pipeline">Pipeline</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={newJobPriority} onValueChange={(v) => setNewJobPriority(v as ComputeJob['priority'])}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">GPU Count</label>
                <Select value={String(newJobGpus)} onValueChange={(v) => setNewJobGpus(parseInt(v))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (CPU only)</SelectItem>
                    <SelectItem value="1">1 GPU</SelectItem>
                    <SelectItem value="2">2 GPUs</SelectItem>
                    <SelectItem value="4">4 GPUs</SelectItem>
                    <SelectItem value="8">8 GPUs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Input Dataset (optional)</label>
                <Input
                  value={newJobDataset}
                  onChange={(e) => setNewJobDataset(e.target.value)}
                  placeholder="Dataset name or path..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Cost Estimate */}
            <div className="p-3 rounded-lg bg-muted/50 mb-4">
              <div className="flex justify-between text-sm">
                <span>Estimated Cost:</span>
                <span className="font-medium text-green-600">$0.00 (Free Tier)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                In production, this would be ${(newJobGpus * 0.5 * (newJobType === 'training' ? 24 : 4)).toFixed(2)}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob} disabled={!newJobName.trim()}>
                Submit Job
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        {/* Jobs List */}
        <div className="flex-1 space-y-4">
          {jobs.map(job => (
            <Card 
              key={job.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedJob?.id === job.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedJob(job)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{job.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.submitter} • Submitted {formatTimeAgo(job.submittedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(job.status)}
                    {getPriorityBadge(job.priority)}
                  </div>
                </div>

                {job.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('compute.progress') || 'Progress'}</span>
                      <span className="font-medium">{Math.round(job.progress)}%</span>
                    </div>
                    <Progress value={job.progress} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>⏱️ {job.computeHoursUsed.toFixed(1)} / {job.computeHoursTotal} hrs</span>
                      <span>🎮 {job.gpusAllocated} GPUs</span>
                      <span>💾 {job.memoryUsed}</span>
                      {job.estimatedCost !== undefined && (
                        <span>💰 ${job.estimatedCost.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                )}

                {job.status === 'completed' && (
                  <div className="text-sm text-green-600 space-y-1">
                    <p>✅ Completed in {(job.computeHoursUsed).toFixed(1)} compute hours</p>
                    {job.estimatedCost !== undefined && (
                      <p>💰 Cost: ${job.estimatedCost.toFixed(2)}</p>
                    )}
                    <p>📅 Completed: {job.completedAt?.toLocaleString()}</p>
                  </div>
                )}

                {job.status === 'queued' && (
                  <div className="text-sm text-yellow-600">
                    ⏳ Waiting in queue...
                  </div>
                )}

                {job.status === 'cancelled' && (
                  <div className="text-sm text-gray-500">
                    🛑 Cancelled by user
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {job.status === 'running' && (
                    <Button size="sm" variant="destructive" onClick={(e) => {
                      e.stopPropagation();
                      handleCancelJob(job.id);
                    }}>
                      Cancel
                    </Button>
                  )}
                  {job.status === 'completed' && (
                    <>
                      <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                        View Logs
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                        Download Results
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="w-96 space-y-4">
          {selectedJob ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selectedJob.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type</span>
                      <p className="capitalize font-medium">{selectedJob.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitter</span>
                      <p className="font-medium">{selectedJob.submitter}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted</span>
                      <p className="font-medium">{selectedJob.submittedAt.toLocaleString()}</p>
                    </div>
                    {selectedJob.completedAt && (
                      <div>
                        <span className="text-muted-foreground">Completed</span>
                        <p className="font-medium">{selectedJob.completedAt.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedJob.estimatedCost !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Est. Cost</span>
                        <p className="font-medium">${selectedJob.estimatedCost.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      {t('compute.view_logs') || 'View Logs'}
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Download Results
                    </Button>
                    {selectedJob.status === 'running' && (
                      <Button size="sm" variant="destructive" className="w-full" onClick={() => handleCancelJob(selectedJob.id)}>
                        Cancel Job
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Logs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent Logs</CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-auto">
                  <div className="space-y-1 font-mono text-xs">
                    {selectedJob.logs.slice(-10).map((log, idx) => (
                      <div key={idx} className={`${
                        log.level === 'ERROR' ? 'text-red-500' :
                        log.level === 'WARN' ? 'text-yellow-500' :
                        log.level === 'SUCCESS' ? 'text-green-500' :
                        log.level === 'DEBUG' ? 'text-gray-400' :
                        'text-foreground'
                      }`}>
                        <span className="text-muted-foreground mr-2">
                          [{log.timestamp.toLocaleTimeString()}]
                        </span>
                        [{log.level}] {log.message}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {t('compute.no_jobs') || 'Select a job to view details'}
              </CardContent>
            </Card>
          )}

          {/* Node Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t('compute.nodes') || 'Compute Nodes'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nodes.map(node => (
                <div key={node.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        node.status === 'online' ? 'bg-green-500' : 
                        node.status === 'maintenance' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium">{node.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {node.runningJobs} jobs
                    </span>
                  </div>
                  {node.status === 'online' && (
                    <div className="grid grid-cols-3 gap-2 text-xs pl-4">
                      <div>CPU: {node.cpuUsage}%</div>
                      <div>MEM: {node.memoryUsage}%</div>
                      <div>GPU: {node.gpuUsage}%</div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
