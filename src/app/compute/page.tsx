'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============ TYPES ============

interface Job {
  id: string;
  name: string;
  type: 'analysis' | 'training' | 'simulation' | 'pipeline';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submitter: string;
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  computeHoursUsed: number;
  computeHoursTotal: number;
  gpusAllocated: number;
  memoryUsed: string;
  memoryTotal: string;
  logs: LogEntry[];
}

interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
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

// ============ MOCK DATA ============

const mockJobs: Job[] = [
  {
    id: 'job-001',
    name: 'GATK Variant Calling Pipeline',
    type: 'pipeline',
    status: 'running',
    priority: 'high',
    submitter: 'Dr. Smith',
    submittedAt: new Date(Date.now() - 2 * 3600000),
    startedAt: new Date(Date.now() - 1.9 * 3600000),
    progress: 67,
    computeHoursUsed: 12.5,
    computeHoursTotal: 18.0,
    gpusAllocated: 1,
    memoryUsed: '24 GB',
    memoryTotal: '32 GB',
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
    submittedAt: new Date(Date.now() - 4 * 3600000),
    startedAt: new Date(Date.now() - 3.8 * 3600000),
    progress: 45,
    computeHoursUsed: 28.3,
    computeHoursTotal: 64.0,
    gpusAllocated: 4,
    memoryUsed: '48 GB',
    memoryTotal: '64 GB',
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
    submittedAt: new Date(Date.now() - 30 * 60000),
    progress: 0,
    computeHoursUsed: 0,
    computeHoursTotal: 8.0,
    gpusAllocated: 0,
    memoryUsed: '0 GB',
    memoryTotal: '16 GB',
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
    submittedAt: new Date(Date.now() - 24 * 3600000),
    startedAt: new Date(Date.now() - 23.5 * 3600000),
    completedAt: new Date(Date.now() - 20 * 3600000),
    progress: 100,
    computeHoursUsed: 42.0,
    computeHoursTotal: 42.0,
    gpusAllocated: 2,
    memoryUsed: '0 GB',
    memoryTotal: '32 GB',
    logs: [
      { timestamp: new Date(Date.now() - 86400000), level: 'INFO', message: 'Training started with 500K samples' },
      { timestamp: new Date(Date.now() - 72000000), level: 'INFO', message: 'Epoch 50/200 - Loss: 0.342 - Val Loss: 0.398' },
      { timestamp: new Date(Date.now() - 57600000), level: 'INFO', message: 'Epoch 100/200 - Loss: 0.189 - Val Loss: 0.245' },
      { timestamp: new Date(Date.now() - 43200000), level: 'INFO', message: 'Epoch 150/200 - Loss: 0.123 - Val Loss: 0.178' },
      { timestamp: new Date(Date.now() - 28800000), level: 'INFO', message: 'Training complete. Best val_loss: 0.165 at epoch 178' },
      { timestamp: new Date(Date.now() - 28790000), level: 'INFO', message: 'Model saved to /models/toxicity_v2.pt' },
    ],
  },
];

const mockNodes: ComputeNode[] = [
  { id: 'node-1', name: 'GPU-Node-01', status: 'online', cpuUsage: 78, memoryUsage: 65, gpuUsage: 92, gpus: 4, runningJobs: 3 },
  { id: 'node-2', name: 'GPU-Node-02', status: 'online', cpuUsage: 45, memoryUsage: 52, gpuUsage: 78, gpus: 4, runningJobs: 2 },
  { id: 'node-3', name: 'CPU-Node-01', status: 'online', cpuUsage: 62, memoryUsage: 71, gpuUsage: 0, gpus: 0, runningJobs: 5 },
  { id: 'node-4', name: 'GPU-Node-03', status: 'maintenance', cpuUsage: 0, memoryUsage: 10, gpuUsage: 0, gpus: 4, runningJobs: 0 },
];

// ============ COMPUTE PAGE ============

export default function ComputePage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [nodes] = useState<ComputeNode[]>(mockNodes);

  // Auto-update running jobs
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === 'running') {
          const newProgress = Math.min(100, job.progress + Math.random() * 2);
          return {
            ...job,
            progress: newProgress,
            computeHoursUsed: job.computeHoursUsed + (Math.random() * 0.1),
            ...(newProgress >= 100 ? { status: 'completed' as const, completedAt: new Date() } : {}),
          };
        }
        return job;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'running': return <Badge className="bg-blue-500 animate-pulse">{t('compute.running')}</Badge>;
      case 'queued': return <Badge className="bg-yellow-500">{t('compute.queued')}</Badge>;
      case 'completed': return <Badge className="bg-green-500">{t('compute.completed')}</Badge>;
      case 'failed': return <Badge variant="destructive">{t('compute.failed')}</Badge>;
      case 'cancelled': return <Badge variant="secondary">{t('compute.cancelled')}</Badge>;
    }
  };

  const getPriorityBadge = (priority: Job['priority']) => {
    const colors = { low: 'bg-gray-400', normal: 'bg-blue-400', high: 'bg-orange-400', urgent: 'bg-red-500' };
    return <Badge className={colors[priority]}>{t(`compute.${priority}`)}</Badge>;
  };

  const totalCompute = jobs.reduce((acc, j) => acc + j.computeHoursUsed, 0);
  const activeJobs = jobs.filter(j => j.status === 'running').length;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('compute.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('compute.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm text-muted-foreground">{t('compute.active_jobs')}</p>
              <p className="text-xl font-bold text-blue-500">{activeJobs}</p>
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
              <p className="text-xl font-bold text-purple-500">
                {jobs.filter(j => j.status === 'running').reduce((a, j) => a + j.gpusAllocated, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
              <p className="text-xl font-bold text-green-500">
                {activeJobs > 0 
                  ? Math.round(jobs.filter(j => j.status === 'running').reduce((a, j) => a + j.progress, 0) / activeJobs)
                  : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6">
        {/* Jobs List */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('compute.jobs')}</h2>
            <Button>{t('compute.new_job')}</Button>
          </div>

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
                      <span>{t('compute.progress')}</span>
                      <span className="font-medium">{Math.round(job.progress)}%</span>
                    </div>
                    <Progress value={job.progress} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>⏱️ {job.computeHoursUsed.toFixed(1)} / {job.computeHoursTotal} hrs</span>
                      <span>🎮 {job.gpusAllocated} GPUs</span>
                      <span>💾 {job.memoryUsed}</span>
                    </div>
                  </div>
                )}

                {job.status === 'completed' && (
                  <div className="text-sm text-green-600">
                    ✓ Completed in {(job.computeHoursUsed).toFixed(1)} compute hours
                  </div>
                )}
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
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      {t('compute.view_logs')}
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Download Results
                    </Button>
                    {selectedJob.status === 'running' && (
                      <Button size="sm" variant="destructive" className="w-full">
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
                {t('compute.no_jobs')}
              </CardContent>
            </Card>
          )}

          {/* Node Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t('compute.nodes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nodes.map(node => (
                <div key={node.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        node.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-medium">{node.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {node.runningJobs} jobs
                    </span>
                  </div>
                  {node.status === 'online' && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
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

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
