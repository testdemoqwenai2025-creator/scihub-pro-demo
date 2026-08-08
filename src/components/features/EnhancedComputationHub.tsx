'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

// ============ TYPES ============

interface ComputeResource {
  id: string;
  name: string;
  type: 'quantum' | 'hpc' | 'ai' | 'bioinformatics';
  status: 'available' | 'busy' | 'offline' | 'maintenance';
  capacity: number;
  used: number;
  specs: string[];
  region: string;
}

interface JobQueue {
  id: string;
  name: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  submitter: string;
  computeTime: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// ============ QUANTUM COMPUTING SECTION ============

function QuantumComputingSection() {
  const [quantumBackends] = useState([
    {
      id: 'ibm-montreal',
      name: 'IBM Montreal',
      qubits: 127,
      type: 'Superconducting',
      status: 'available',
      queueTime: '~2 min',
      errorRate: '0.05%'
    },
    {
      id: 'google-sycamore',
      name: 'Google Sycamore',
      qubits: 53,
      type: 'Superconducting',
      status: 'busy',
      queueTime: '~15 min',
      errorRate: '0.03%'
    },
    {
      id: 'ionq-harmony',
      name: 'IonQ Harmony',
      qubits: 32,
      type: 'Trapped Ion',
      status: 'available',
      queueTime: '~5 min',
      errorRate: '0.01%'
    },
    {
      id: 'rigetti-aspen',
      name: 'Rigetti Aspen-M',
      qubits: 80,
      type: 'Superconducting',
      status: 'available',
      queueTime: '~8 min',
      errorRate: '0.08%'
    }
  ]);

  const [quantumAlgorithms] = useState([
    { name: 'VQE (Variational Quantum Eigensolver)', category: 'Chemistry', difficulty: 'Advanced' },
    { name: 'QAOA (Quantum Approximate Optimization)', category: 'Optimization', difficulty: 'Intermediate' },
    { name: 'Grover\'s Search Algorithm', category: 'Database', difficulty: 'Beginner' },
    { name: 'Shor\'s Factoring', category: 'Cryptography', difficulty: 'Expert' },
    { name: 'Quantum Phase Estimation', category: 'Simulation', difficulty: 'Advanced' },
    { name: 'QFT (Quantum Fourier Transform)', category: 'Signal Processing', difficulty: 'Intermediate' }
  ]);

  return (
    <div className="space-y-6">
      {/* Quantum Backends Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">⚛️</span> Quantum Processing Units (QPUs)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quantumBackends.map((backend) => (
            <Card key={backend.id} className={`border-2 ${
              backend.status === 'available' ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' :
              backend.status === 'busy' ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20' :
              'border-gray-200'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{backend.name}</CardTitle>
                    <CardDescription className="mt-1">{backend.type} • {backend.qubits} Qubits</CardDescription>
                  </div>
                  <Badge 
                    variant={backend.status === 'available' ? 'default' : 'secondary'}
                    className={backend.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'}
                  >
                    {backend.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Queue Time:</span>
                    <span className="font-medium">{backend.queueTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Error Rate:</span>
                    <span className="font-medium">{backend.errorRate}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm" variant="outline">
                  Launch Quantum Job →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quantum Algorithms */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🔬</span> Available Algorithms
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quantumAlgorithms.map((algo, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm">{algo.name}</h4>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">{algo.category}</Badge>
                  <Badge variant="outline" className="text-xs">{algo.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">292</p>
            <p className="text-sm opacity-90">Total Qubits</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm opacity-90">QPUs Online</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">6</p>
            <p className="text-sm opacity-90">Algorithms</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">99.9%</p>
            <p className="text-sm opacity-90">Uptime</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ HPC CLUSTERS SECTION ============

function HPCClustersSection() {
  const [clusters] = useState([
    {
      id: 'cluster-alpha',
      name: 'Alpha Cluster',
      nodes: 1024,
      cores: 16384,
      gpuNodes: 128,
      memory: '64TB',
      status: 'operational',
      utilization: 78
    },
    {
      id: 'cluster-beta',
      name: 'Beta Cluster',
      nodes: 512,
      cores: 8192,
      gpuNodes: 64,
      memory: '32TB',
      status: 'operational',
      utilization: 45
    },
    {
      id: 'cluster-gamma',
      name: 'Gamma Cluster (GPU)',
      nodes: 256,
      cores: 4096,
      gpuNodes: 256,
      memory: '16TB',
      status: 'maintenance',
      utilization: 0
    }
  ]);

  const [jobQueue] = useState<JobQueue[]>([
    { id: 'j1', name: 'Molecular Dynamics Simulation', type: 'MD', status: 'running', progress: 67, submitter: 'Dr. Chen', computeTime: '48h', priority: 'high' },
    { id: 'j2', name: 'Genome Assembly Pipeline', type: 'Bio', status: 'queued', progress: 0, submitter: 'Prof. Lee', computeTime: '12h', priority: 'normal' },
    { id: 'j3', name: 'Neural Network Training', type: 'AI', status: 'running', progress: 34, submitter: 'Dr. Patel', computeTime: '24h', priority: 'urgent' },
    { id: 'j4', name: 'CFD Simulation', type: 'Eng', status: 'completed', progress: 100, submitter: 'Dr. Kim', computeTime: '72h', priority: 'low' }
  ]);

  return (
    <div className="space-y-6">
      {/* HPC Clusters Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🖥️</span> HPC Infrastructure
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {clusters.map((cluster) => (
            <Card key={cluster.id} className={
              cluster.status === 'maintenance' ? 'opacity-60 border-dashed' : ''
            }>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{cluster.name}</CardTitle>
                  <Badge 
                    variant={cluster.status === 'operational' ? 'default' : 'secondary'}
                    className={cluster.status === 'maintenance' ? 'bg-orange-500' : 'bg-green-500'}
                  >
                    {cluster.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nodes</p>
                      <p className="font-semibold text-lg">{cluster.nodes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cores</p>
                      <p className="font-semibold text-lg">{cluster.cores.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">GPU Nodes</p>
                      <p className="font-semibold text-lg">{cluster.gpuNodes}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Memory</p>
                      <p className="font-semibold text-lg">{cluster.memory}</p>
                    </div>
                  </div>
                  
                  {cluster.status === 'operational' && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-medium">{cluster.utilization}%</span>
                      </div>
                      <Progress value={cluster.utilization} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Job Queue */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span> Active Job Queue
        </h3>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Job Name</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Progress</th>
                    <th className="text-left p-3 text-sm font-medium">Submitter</th>
                    <th className="text-left p-3 text-sm font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {jobQueue.map((job) => (
                    <tr key={job.id} className="border-t">
                      <td className="p-3 text-sm font-medium">{job.name}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{job.type}</Badge></td>
                      <td className="p-3">
                        <Badge 
                          variant={job.status === 'running' ? 'default' : job.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            job.status === 'running' ? 'bg-blue-500' : 
                            job.status === 'completed' ? 'bg-green-500' : 
                            job.status === 'failed' ? 'bg-red-500' : ''
                          }
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="p-3 min-w-[120px]">
                        {job.status === 'running' ? (
                          <div className="space-y-1">
                            <Progress value={job.progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">{job.progress}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">{job.submitter}</td>
                      <td className="p-3">
                        <Badge 
                          variant={job.priority === 'urgent' ? 'default' : 'secondary'}
                          className={
                            job.priority === 'urgent' ? 'bg-red-500' : 
                            job.priority === 'high' ? 'bg-orange-500' : ''
                          }
                        >
                          {job.priority}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit New Job */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">⚡ Submit HPC Job</h3>
              <p className="text-slate-300 mt-1">Access 16,384+ cores across our cluster infrastructure</p>
            </div>
            <Button size="lg" className="bg-white text-black hover:bg-slate-200">
              Launch Job →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ AI PLATFORMS SECTION ============

function AIPlatformsSection() {
  const [aiModels] = useState([
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      context: '128K tokens',
      speed: 'Fast',
      cost: '$0.01/1K tokens',
      capabilities: ['Text', 'Code', 'Analysis'],
      available: true
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      context: '200K tokens',
      speed: 'Medium',
      cost: '$0.015/1K tokens',
      capabilities: ['Text', 'Analysis', 'Long-form'],
      available: true
    },
    {
      id: 'llama-3-400b',
      name: 'Llama 3 400B',
      provider: 'Meta (Self-hosted)',
      context: '128K tokens',
      speed: 'Fast',
      cost: 'Free (Compute only)',
      capabilities: ['Text', 'Code', 'Multilingual'],
      available: true
    },
    {
      id: 'gemini-ultra',
      name: 'Gemini Ultra',
      provider: 'Google',
      context: '1M tokens',
      speed: 'Medium',
      cost: '$0.02/1K tokens',
      capabilities: ['Multimodal', 'Text', 'Image', 'Code'],
      available: false
    }
  ]);

  const [gpuPools] = useState([
    { name: 'NVIDIA A100 80GB', count: 64, available: 23, performance: '312 TFLOPS' },
    { name: 'NVIDIA H100 80GB', count: 32, available: 8, performance: '1979 TFLOPS' },
    { name: 'AMD MI250X', count: 16, available: 12, performance: '383 TFLOPS' }
  ]);

  return (
    <div className="space-y-6">
      {/* AI Models Available */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🤖</span> AI Model Hub
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiModels.map((model) => (
            <Card key={model.id} className={!model.available ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{model.name}</CardTitle>
                    <CardDescription className="mt-1">{model.provider}</CardDescription>
                  </div>
                  <Badge variant={model.available ? 'default' : 'secondary'}>
                    {model.available ? 'Available' : 'Maintenance'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Context Window:</span>
                    <span className="font-medium">{model.context}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="font-medium">{model.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-medium">{model.cost}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {model.capabilities.map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                  ))}
                </div>
                <Button className="w-full mt-4" size="sm" disabled={!model.available}>
                  Use Model →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* GPU Resource Pools */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🎮</span> GPU Compute Pools
        </h3>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">GPU Type</th>
                    <th className="text-left p-3 text-sm font-medium">Total</th>
                    <th className="text-left p-3 text-sm font-medium">Available</th>
                    <th className="text-left p-3 text-sm font-medium">Performance</th>
                    <th className="text-left p-3 text-sm font-medium">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {gpuPools.map((gpu, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 font-medium">{gpu.name}</td>
                      <td className="p-3">{gpu.count}</td>
                      <td className="p-3">
                        <span className={gpu.available < 10 ? 'text-red-500 font-medium' : 'text-green-600'}>
                          {gpu.available}
                        </span>
                      </td>
                      <td className="p-3">{gpu.performance}</td>
                      <td className="p-3 min-w-[150px]">
                        <Progress value={(gpu.count - gpu.available) / gpu.count * 100} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🧠</div>
            <h4 className="font-semibold">Fine-Tuning</h4>
            <p className="text-sm text-muted-foreground mt-1">Custom model training on your data</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-semibold">Inference API</h4>
            <p className="text-sm text-muted-foreground mt-1">Scalable prediction endpoints</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🔄</div>
            <h4 className="font-semibold">AutoML</h4>
            <p className="text-sm text-muted-foreground mt-1">Automated ML pipeline creation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ BIOINFORMATICS TOOLS SECTION ============

function BioinformaticsToolsSection() {
  const [tools] = useState([
    {
      id: 'gatk',
      name: 'GATK 5.0',
      category: 'Genomics',
      description: 'Variant discovery and genotyping pipeline',
      version: '5.0.2',
      inputs: ['BAM/CRAM', 'Reference FASTQ', 'VCF'],
      output: ['VCF', 'Metrics']
    },
    {
      id: 'blast',
      name: 'BLAST+',
      category: 'Sequence Analysis',
      description: 'Basic Local Alignment Search Tool',
      version: '2.15.0',
      inputs: ['FASTA', 'FASTQ', 'Nucleotide', 'Protein'],
      output: ['Alignments', 'Hit Table']
    },
    {
      id: 'alphafold',
      name: 'AlphaFold 3',
      category: 'Structure Prediction',
      description: 'AI-powered protein structure prediction',
      version: '3.0.0',
      inputs: ['Amino Acid Sequence', 'MSA'],
      output: ['PDB', 'Confidence Scores', 'PAE Matrix']
    },
    {
      id: 'bowtie2',
      name: 'Bowtie 2',
      category: 'Alignment',
      description: 'Ultrafast short-read alignment',
      version: '2.5.4',
      inputs: ['FASTQ', 'Reference Index'],
      output: ['SAM/BAM', 'Stats']
    },
    {
      id: 'samtools',
      name: 'SAMtools',
      category: 'Analysis',
      description: 'Utilities for SAM/BAM files',
      version: '1.21',
      inputs: ['SAM/BAM', 'CRAM'],
      output: ['Sorted BAM', 'Index', 'Stats']
    },
    {
      id: 'bcftools',
      name: 'BCFtools',
      category: 'Variant Calling',
      description: 'Manipulating VCF/BCF files',
      version: '1.21',
      inputs: ['BAM', 'Reference', 'VCF'],
      output: ['VCF', 'Consensus']
    }
  ]);

  const [pipelines] = useState([
    {
      id: 'rna-seq',
      name: 'RNA-Seq Analysis',
      steps: 6,
      estimatedTime: '4-8 hours',
      toolsUsed: ['FastQC', 'STAR', 'featureCounts', 'DESeq2']
    },
    {
      id: 'variant-calling',
      name: 'Whole Genome Variant Calling',
      steps: 12,
      estimatedTime: '24-48 hours',
      toolsUsed: ['BWA', 'GATK', 'Picard', 'VQSR']
    },
    {
      id: 'single-cell',
      name: 'Single-Cell RNA-Seq',
      steps: 8,
      estimatedTime: '6-12 hours',
      toolsUsed: ['CellRanger', 'Seurat', 'Scanpy']
    },
    {
      id: 'metagenomics',
      name: 'Metagenomics Analysis',
      steps: 7,
      estimatedTime: '8-16 hours',
      toolsUsed: ['Kraken2', 'Bracken', 'HUMAnN3']
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Bioinformatics Tools Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🧬</span> Bioinformatics Tools Library
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{tool.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{tool.version}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">{tool.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Inputs:</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.inputs.map((input) => (
                        <Badge key={input} variant="secondary" className="text-xs">{input}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" size="sm" variant="outline">
                    Launch Tool →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pre-built Pipelines */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🔗</span> Pre-built Analysis Pipelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pipelines.map((pipeline) => (
            <Card key={pipeline.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{pipeline.name}</CardTitle>
                  <Badge className="bg-emerald-500">{pipeline.steps} Steps</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="font-medium">{pipeline.estimatedTime}</span>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Tools Used:</p>
                    <div className="flex flex-wrap gap-1">
                      {pipeline.toolsUsed.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Run Pipeline →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">6+</p>
            <p className="text-sm text-muted-foreground">Tools Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">4</p>
            <p className="text-sm text-muted-foreground">Pre-built Pipelines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">24/7</p>
            <p className="text-sm text-muted-foreground">Availability</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">∞</p>
            <p className="text-sm text-muted-foreground">Free Tier Jobs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ CHEMINFORMATICS SECTION ============

function CheminformaticsSection() {
  const [tools] = useState([
    {
      id: 'rdkit',
      name: 'RDKit',
      category: 'Chemistry Toolkit',
      description: 'Open-source cheminformatics and machine learning',
      version: '2024.03.0',
      inputs: ['SMILES', 'SDF', 'MOL'],
      output: ['Descriptors', 'Fingerprints', 'Molecular Graphs']
    },
    {
      id: 'openbabel',
      name: 'Open Babel',
      category: 'File Conversion',
      description: 'Chemical file format converter and toolbox',
      version: '3.1.1',
      inputs: ['55+ Formats'],
      output: ['Converted Files', '3D Coordinates']
    },
    {
      id: 'autodock',
      name: 'AutoDock Vina',
      category: 'Molecular Docking',
      description: 'Protein-ligand docking simulation',
      version: '1.2.5',
      inputs: ['Receptor PDB', 'Ligand MOL2'],
      output: ['Binding Poses', 'Affinity Scores']
    },
    {
      id: 'gromacs',
      name: 'GROMACS',
      category: 'MD Simulation',
      description: 'Molecular dynamics package for biochemistry',
      version: '2024.3',
      inputs: ['Topology', 'Coordinate Files'],
      output: ['Trajectories', 'Energy Data']
    },
    {
      id: 'ambertools',
      name: 'AmberTools',
      category: 'Simulation Suite',
      description: 'Biomolecular simulation programs',
      version: '24.0',
      inputs: ['PRMTOP', 'INPCRD'],
      output: ['Trajectories', 'Analysis']
    },
    {
      id: 'chemaxon',
      name: 'ChemAxon Marble',
      category: 'Prediction Suite',
      description: 'Chemical property prediction platform',
      version: '23.20',
      inputs: ['Structure', 'SMILES'],
      output: ['pKa', 'LogP', 'Solubility']
    }
  ]);

  const [workflows] = useState([
    {
      id: 'drug-discovery',
      name: 'Virtual Screening Pipeline',
      steps: 8,
      estimatedTime: '6-24 hours',
      toolsUsed: ['Ligand Prep', 'Docking', 'Scoring', 'ADMET']
    },
    {
      id: 'qsar',
      name: 'QSAR Modeling Workflow',
      steps: 6,
      estimatedTime: '2-4 hours',
      toolsUsed: ['Descriptor Calc', 'Feature Selection', 'ML Model', 'Validation']
    },
    {
      id: 'md-setup',
      name: 'MD Simulation Setup',
      steps: 10,
      estimatedTime: '1-2 hours setup + runtime',
      toolsUsed: ['Structure Prep', 'Solvation', 'Minimization', 'Equilibration']
    },
    {
      id: 'property-prediction',
      name: 'Property Prediction Batch',
      steps: 4,
      estimatedTime: '30 min - 2 hours',
      toolsUsed: ['Input Parser', 'Calculator', 'Report Generator']
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Cheminformatics Tools Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">⚗️</span> Cheminformatics Tools Library
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{tool.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{tool.version}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">{tool.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Inputs:</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.inputs.map((input) => (
                        <Badge key={input} variant="secondary" className="text-xs">{input}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" size="sm" variant="outline">
                    Launch Tool →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pre-built Workflows */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🔬</span> Pre-built Chemistry Workflows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{workflow.name}</CardTitle>
                  <Badge className="bg-violet-500">{workflow.steps} Steps</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="font-medium">{workflow.estimatedTime}</span>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Tools Used:</p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.toolsUsed.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Run Workflow →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-violet-600">6+</p>
            <p className="text-sm text-muted-foreground">Tools Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">4</p>
            <p className="text-sm text-muted-foreground">Pre-built Workflows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">GPU</p>
            <p className="text-sm text-muted-foreground">Accelerated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">∞</p>
            <p className="text-sm text-muted-foreground">Free Tier Jobs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function EnhancedComputationHub() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50/50 to-background dark:via-slate-950/50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">⚡</span>
            <h1 className="text-3xl md:text-4xl font-bold">
              Enhanced Computation Hub
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Unified access to Quantum Computing, HPC Clusters, AI Platforms, Bioinformatics, and Cheminformatics Tools — 
            all in one integrated scientific computing environment.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              ⚛️ Quantum Ready
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              🖥️ 16K+ Cores
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              🤖 AI Models
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              🧬 Bioinformatics
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white">
              ⚗️ Cheminformatics
            </Badge>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 max-w-5xl mx-auto mb-8 h-auto">
            <TabsTrigger value="quantum" className="gap-2 py-3 text-xs sm:text-sm">
              <span>⚛️</span> Quantum
            </TabsTrigger>
            <TabsTrigger value="hpc" className="gap-2 py-3 text-xs sm:text-sm">
              <span>🖥️</span> HPC Clusters
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 py-3 text-xs sm:text-sm">
              <span>🤖</span> AI Platforms
            </TabsTrigger>
            <TabsTrigger value="bio" className="gap-2 py-3 text-xs sm:text-sm">
              <span>🧬</span> Bioinformatics
            </TabsTrigger>
            <TabsTrigger value="chem" className="gap-2 py-3 text-xs sm:text-sm">
              <span>⚗️</span> Cheminformatics
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2 py-3 text-xs sm:text-sm">
              <span>📊</span> System Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quantum">
            <QuantumComputingSection />
          </TabsContent>

          <TabsContent value="hpc">
            <HPCClustersSection />
          </TabsContent>

          <TabsContent value="ai">
            <AIPlatformsSection />
          </TabsContent>

          <TabsContent value="bio">
            <BioinformaticsToolsSection />
          </TabsContent>

          <TabsContent value="chem">
            <CheminformaticsSection />
          </TabsContent>

          <TabsContent value="status">
            <SystemStatusDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============ SYSTEM STATUS DASHBOARD ============

function SystemStatusDashboard() {
  const [systemMetrics] = useState({
    totalJobsToday: 1247,
    activeJobs: 89,
    completedJobs: 1158,
    failedJobs: 12,
    avgWaitTime: '4.2 min',
    totalComputeHours: 2847.5,
    gpuUtilization: 76,
    cpuUtilization: 62,
    storageUsed: '847 TB / 1.2 PB'
  });

  const [recentActivity] = useState([
    { time: '2 min ago', event: 'Quantum job completed - VQE calculation', user: 'Dr. Smith', type: 'success' },
    { time: '5 min ago', event: 'HPC cluster scaled up +32 nodes', user: 'System', type: 'info' },
    { time: '8 min ago', event: 'AlphaFold prediction started', user: 'Prof. Johnson', type: 'info' },
    { time: '15 min ago', event: 'Job failed - Out of memory', user: 'Dr. Chen', type: 'error' },
    { time: '22 min ago', event: 'Pipeline completed - RNA-Seq analysis', user: 'Dr. Patel', type: 'success' },
    { time: '30 min ago', event: 'New GPU pool added - 8x H100', user: 'Admin', type: 'info' }
  ]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Jobs Today</p>
            <p className="text-3xl font-bold">{systemMetrics.totalJobsToday.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Now</p>
            <p className="text-3xl font-bold text-blue-600">{systemMetrics.activeJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">Running jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Compute Hours</p>
            <p className="text-3xl font-bold">{systemMetrics.totalComputeHours.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Hours used today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Wait Time</p>
            <p className="text-3xl font-bold text-green-600">{systemMetrics.avgWaitTime}</p>
            <p className="text-xs text-green-600 mt-1">↓ 18% faster</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">GPU Utilization</span>
                <span className="text-sm">{systemMetrics.gpuUtilization}%</span>
              </div>
              <Progress value={systemMetrics.gpuUtilization} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">CPU Utilization</span>
                <span className="text-sm">{systemMetrics.cpuUtilization}%</span>
              </div>
              <Progress value={systemMetrics.cpuUtilization} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Storage Used</span>
                <span className="text-sm">{systemMetrics.storageUsed}</span>
              </div>
              <Progress value={70} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[240px] overflow-y-auto">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
              <div>
                <h3 className="font-semibold text-lg">All Systems Operational</h3>
                <p className="text-sm text-muted-foreground">No reported outages or degraded performance</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
