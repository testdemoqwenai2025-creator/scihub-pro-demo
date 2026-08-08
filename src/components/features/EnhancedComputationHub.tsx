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
  type: 'quantum' | 'hpc' | 'ai' | 'bioinformatics' | 'cheminformatics' | 'molecular' | 'materials' | 'astronomy' | 'climate' | 'physics';
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
    { name: "Grover's Search Algorithm", category: 'Database', difficulty: 'Beginner' },
    { name: "Shor's Factoring", category: 'Cryptography', difficulty: 'Expert' },
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

// ============ CHEMINFORMATICS & DRUG DISCOVERY SECTION ============

function CheminformaticsSection() {
  const [drugDiscoveryTools] = useState([
    {
      id: 'rdkit-pipeline',
      name: 'RDKit Workflow Engine',
      category: 'Chemical Informatics',
      description: 'Comprehensive cheminformatics toolkit for molecular manipulation and analysis',
      version: '2024.03.1',
      features: ['Molecular fingerprints', 'Substructure search', 'Descriptor calculation', 'SMILES parsing'],
      status: 'available'
    },
    {
      id: 'autodock-vina',
      name: 'AutoDock Vina',
      category: 'Molecular Docking',
      description: 'High-performance molecular docking for virtual screening campaigns',
      version: '1.2.5',
      features: ['Rigid/flexible docking', 'Scoring functions', 'Multi-conformer support', 'GPU accelerated'],
      status: 'available'
    },
    {
      id: 'qsar-modeler',
      name: 'QSAR Modeler Pro',
      category: 'Predictive Modeling',
      description: 'Build quantitative structure-activity relationship models with ML',
      version: '3.1.0',
      features: ['Random Forest QSAR', 'Neural Network models', 'Applicability domain', 'Validation suite'],
      status: 'available'
    },
    {
      id: 'admet-predictor',
      name: 'ADMET Predictor',
      category: 'Pharmacokinetics',
      description: 'Predict absorption, distribution, metabolism, excretion, and toxicity',
      version: '2.8.0',
      features: ['Solubility prediction', 'CYP450 interactions', 'hERG liability', 'Blood-brain barrier'],
      status: 'available'
    },
    {
      id: 'pharmacophore',
      name: 'Pharmacophore Designer',
      category: 'Drug Design',
      description: 'Identify and design pharmacophore models from active compounds',
      version: '1.5.2',
      features: ['Feature extraction', '3D pharmacophore mapping', 'Screening queries', 'Scaffold hopping'],
      status: 'maintenance'
    },
    {
      id: 'chembl-miner',
      name: 'ChEMBL Data Miner',
      category: 'Database Integration',
      description: 'Direct access to ChEMBL bioactivity database with advanced querying',
      version: '4.0',
      features: ['Bioactivity data', 'Target binding', 'Assay results', 'Literature links'],
      status: 'available'
    }
  ]);

  const [screeningCampaigns] = useState([
    {
      id: 'covid-main-protease',
      name: 'COVID-19 Main Protease Inhibitors',
      target: 'Mpro (3CLpro)',
      compoundsScreened: 2450000,
      hits: 847,
      status: 'active',
      lastUpdate: '2 hours ago'
    },
    {
      id: 'kinase-panel',
      name: 'Kinase Panel Screening',
      target: 'EGFR, VEGFR, CDK family',
      compoundsScreened: 890000,
      hits: 1234,
      status: 'active',
      lastUpdate: '6 hours ago'
    },
    {
      id: 'gpcr-library',
      name: 'GPCR Focused Library',
      target: 'GPCRome (300+ receptors)',
      compoundsScreened: 450000,
      hits: 567,
      status: 'completed',
      lastUpdate: '1 day ago'
    }
  ]);

  const [chemicalDatabases] = useState([
    { name: 'ChEMBL', entries: '2.4M compounds', type: 'Bioactivity', size: '98 GB' },
    { name: 'PubChem', entries: '111M compounds', type: 'General', size: '2.1 TB' },
    { name: 'ZINC15', entries: '750M purchasable', type: 'Virtual', size: '4.8 TB' },
    { name: 'DrugBank', entries: '15K drugs', type: 'Approved/Clinical', size: '12 GB' }
  ]);

  return (
    <div className="space-y-6">
      {/* Drug Discovery Tools */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🧪</span> Cheminformatics & Drug Discovery Toolkit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drugDiscoveryTools.map((tool) => (
            <Card key={tool.id} className={`hover:shadow-md transition-shadow ${!tool.available ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                    <CardDescription className="mt-1">{tool.description}</CardDescription>
                  </div>
                  <Badge variant={tool.status === 'available' ? 'default' : 'secondary'} 
                        className={tool.status === 'available' ? 'bg-green-500' : 'bg-orange-500'}>
                    {tool.version}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3">{tool.category}</Badge>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tool.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">{feature}</Badge>
                  ))}
                  {tool.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">+{tool.features.length - 3}</Badge>
                  )}
                </div>
                <Button className="w-full" size="sm" disabled={tool.status !== 'available'}>
                  Launch Tool →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Virtual Screening Campaigns */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span> Active Virtual Screening Campaigns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {screeningCampaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{campaign.name}</CardTitle>
                  <Badge className={campaign.status === 'active' ? 'bg-green-500' : 'bg-blue-500'}>
                    {campaign.status}
                  </Badge>
                </div>
                <CardDescription>Target: {campaign.target}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compounds Screened:</span>
                    <span className="font-bold text-amber-700">{campaign.compoundsScreened.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hits Identified:</span>
                    <span className="font-bold text-green-700">{campaign.hits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hit Rate:</span>
                    <span className="font-medium">{((campaign.hits / campaign.compoundsScreened) * 100).toFixed(3)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Updated {campaign.lastUpdate}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chemical Databases Access */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">💊</span> Integrated Chemical Databases
        </h3>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Database</th>
                    <th className="text-left p-3 text-sm font-medium">Entries</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Size</th>
                    <th className="text-left p-3 text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {chemicalDatabases.map((db, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 font-medium">{db.name}</td>
                      <td className="p-3">{db.entries}</td>
                      <td className="p-3"><Badge variant="outline">{db.type}</Badge></td>
                      <td className="p-3 text-muted-foreground">{db.size}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline">Query →</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">3.8M</p>
            <p className="text-sm opacity-90">Compounds Screened</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">2,648</p>
            <p className="text-sm opacity-90">Total Hits</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">6</p>
            <p className="text-sm opacity-90">Tools Available</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm opacity-90">Databases Linked</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ MOLECULAR MODELLING & DYNAMICS SECTION ============

function MolecularModellingSection() {
  const [mdEngines] = useState([
    {
      id: 'gromacs',
      name: 'GROMACS 2024',
      category: 'Molecular Dynamics',
      description: 'High-performance MD simulations for biomolecules and materials',
      version: '2024.3',
      features: ['GPU acceleration', 'Free energy calculations', 'Enhanced sampling', 'PME electrostatics'],
      maxAtoms: 'Millions',
      parallelization: 'MPI + OpenMP + CUDA'
    },
    {
      id: 'amber',
      name: 'AMBER 24',
      category: 'Force Fields & MD',
      description: 'Suite of biomolecular simulation programs with advanced force fields',
      version: '24.0',
      features: ['ff19SB force field', 'NMR refinement', 'QM/MM methods', 'Thermodynamic integration'],
      maxAtoms: 'Hundreds of thousands',
      parallelization: 'MPI + GPU'
    },
    {
      id: 'namd',
      name: 'NAMD 3',
      category: 'Scalable MD',
      description: 'Parallel molecular dynamics designed for large simulations',
      version: '3.0.11',
      features: ['Petascale scaling', 'Multiple integrators', 'Tcl scripting', 'Interactive MD'],
      maxAtoms: '100M+',
      parallelization: ' Charm++ (millions of cores)'
    },
    {
      id: 'lammps',
      name: 'LAMMPS',
      category: 'Classical MD',
      description: 'Classical molecular dynamics with potentials for materials, soft matter, and bio',
      version: '2 Aug 2023',
      features: ['Many-body potentials', 'Granular models', 'Peridynamics', 'Machine learning potentials'],
      maxAtoms: 'Billions',
      parallelization: 'MPI + OpenMP + GPU + Kokkos'
    },
    {
      id: 'desmond',
      name: 'Desmond',
      category: 'Drug Discovery MD',
      description: 'High-performance MD code optimized for drug discovery workflows',
      version: '6.3',
      features: '["Event-driven tasks", "Replica exchange", "Free energy perturbation", "Wizard interfaces"]',
      maxAtoms: 'Millions',
      parallelization: 'MPI + CUDA'
    },
    {
      id: 'openmm',
      name: 'OpenMM',
      category: 'Python-native MD',
      description: 'High-performance toolkit for molecular simulation with Python interface',
      version: '8.1.1',
      features: ['Python API', 'Custom forces', 'ML integration', 'Cross-platform'],
      maxAtoms: 'Millions',
      parallelization: 'OpenCL + CUDA'
    }
  ]);

  const [forceFields] = useState([
    { name: 'AMBER ff19SB', type: 'Protein', accuracy: 'Very High', year: 2019 },
    { name: 'CHARMM36m', type: 'Protein/Lipid', accuracy: 'Very High', year: 2017 },
    { name: 'OPLS4', type: 'Small Molecules', accuracy: 'High', year: 2022 },
    { name: 'GAFF 2.11', type: 'General Organic', accuracy: 'Good', year: 2017 },
    { name: 'ReaxFF', type: 'Reactive MD', accuracy: 'Moderate', year: 2016 },
    { name: 'DeepMD', type: 'ML Potential', accuracy: 'Variable', year: 2023 }
  ]);

  const [runningSimulations] = useState([
    {
      id: 'sim-001',
      name: 'SARS-CoV-2 Spike-ACE2 Complex',
      systemSize: '850K atoms',
      duration: '1 μs',
      progress: 67,
      timeRemaining: '48 hours',
      engine: 'GROMACS',
      user: 'Dr. Martinez'
    },
    {
      id: 'sim-002',
      name: 'Membrane Protein GPCR Activation',
      systemSize: '320K atoms',
      duration: '500 ns',
      progress: 34,
      timeRemaining: '72 hours',
      engine: 'NAMD',
      user: 'Prof. Zhang'
    },
    {
      id: 'sim-003',
      name: 'Drug-Target Binding Free Energy',
      systemSize: '45K atoms',
      duration: '100 ns FEP',
      progress: 89,
      timeRemaining: '6 hours',
      engine: 'AMBER',
      user: 'Dr. Williams'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* MD Engines */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🫧</span> Molecular Dynamics Engines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mdEngines.map((engine) => (
            <Card key={engine.id} className="hover:shadow-lg transition-all border-blue-200 hover:border-blue-400">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base text-blue-800 dark:text-blue-200">{engine.name}</CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">{engine.version}</Badge>
                </div>
                <CardDescription>{engine.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3">{engine.category}</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Atoms:</span>
                    <span className="font-medium">{engine.maxAtoms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parallel:</span>
                    <span className="font-medium text-xs">{engine.parallelization}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {typeof engine.features === 'string' 
                    ? JSON.parse(engine.features).slice(0, 2).map((f: string) => (
                        <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                      ))
                    : engine.features.slice(0, 2).map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                      ))
                  }
                </div>
                <Button className="w-full mt-4" size="sm" variant="outline">
                  Configure Simulation →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Force Fields Library */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">⚗️</span> Force Field Library
        </h3>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Force Field</th>
                    <th className="text-left p-3 text-sm font-medium">Application</th>
                    <th className="text-left p-3 text-sm font-medium">Accuracy</th>
                    <th className="text-left p-3 text-sm font-medium">Year</th>
                    <th className="text-left p-3 text-sm font-medium">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {forceFields.map((ff, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{ff.name}</td>
                      <td className="p-3"><Badge variant="outline">{ff.type}</Badge></td>
                      <td className="p-3">
                        <Badge className={
                          ff.accuracy === 'Very High' ? 'bg-green-500' :
                          ff.accuracy === 'High' ? 'bg-blue-500' :
                          ff.accuracy === 'Good' ? 'bg-yellow-500' : 'bg-gray-500'
                        }>
                          {ff.accuracy}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{ff.year}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost">Select →</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Running Simulations */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">▶️</span> Currently Running Simulations
        </h3>
        <div className="space-y-3">
          {runningSimulations.map((sim) => (
            <Card key={sim.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{sim.name}</h4>
                  <Badge variant="outline">{sim.engine}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">System Size:</span>
                    <p className="font-medium">{sim.systemSize}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{sim.duration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span>
                    <p className="font-medium text-blue-600">{sim.timeRemaining}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User:</span>
                    <p className="font-medium">{sim.user}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={sim.progress} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-blue-600 w-12">{sim.progress}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ MATERIALS SCIENCE & NANOTECHNOLOGY SECTION ============

function MaterialsScienceSection() {
  const [dftCodes] = useState([
    {
      id: 'vasp',
      name: 'VASP 6.5',
      category: 'DFT',
      description: 'Vienna Ab initio Simulation Package - industry standard DFT code',
      version: '6.5.0',
      features: ['Plane-wave DFT', 'Hybrid functionals', 'vdW corrections', 'Spin-orbit coupling'],
      license: 'Commercial'
    },
    {
      id: 'quantumespresso',
      name: 'Quantum ESPRESSO 7.4',
      category: 'DFT',
      description: 'Open-source integrated suite for electronic structure calculations',
      version: '7.4',
      features: ['Plane-wave/pseudopotential', 'TDDFT', 'Berry phase', 'Phonon calculations'],
      license: 'Open Source (GPL)'
    },
    {
      id: 'cp2k',
      name: 'CP2K 2024',
      category: 'DFT/MM',
      description: 'Quantum chemistry and solid state physics with mixed Gaussian/plane waves',
      version: '2024.1',
      features: ['Quickstep method', 'DFTB', 'MP2', 'Mixed MPI/OpenMP'],
      license: 'Open Source (GPL)'
    },
    {
      id: 'castep',
      name: 'CASTEP 23',
      category: 'Materials Modeling',
      description: 'Leading code for materials simulation using density functional theory',
      version: '23.0.0',
      features: ['NMR properties', 'Optical spectra', 'Metallic systems', 'Dispersion corrections'],
      license: 'Commercial'
    }
  ]);

  const [materialsProperties] = useState([
    { property: 'Electronic Structure', methods: ['Band Structure', 'DOS', 'PDOS', 'Band Gap'], icon: '⚡' },
    { property: 'Optical Properties', methods: ['Dielectric Function', 'Absorption', 'Reflectivity'], icon: '💡' },
    { property: 'Mechanical', methods: ['Elastic Constants', 'Bulk Modulus', 'Phonons'], icon: '🔧' },
    { property: 'Thermodynamic', methods: ['Free Energy', 'Phase Diagrams', 'Quasi-harmonic'], icon: '🌡️' },
    { property: 'Surface Science', methods: ['Surface Energy', 'Adsorption', 'Work Function'], icon: '📐' },
    { property: 'Transport', methods: ['Conductivity', 'Mobility', 'Seebeck Coefficient'], icon: '🚀' }
  ]);

  const [nanotechTools] = useState([
    {
      id: 'nanodsim',
      name: 'NanoDSim',
      description: 'Nanoscale device simulation with NEGF formalism',
      applications: ['Transistors', 'Sensors', 'Quantum dots'],
      status: 'available'
    },
    {
      id: 'lammps-mat',
      name: 'LAMMPS Materials',
      description: 'Atomistic simulation for nanomaterials and defects',
      applications: ['Graphene', 'Nanotubes', '2D Materials'],
      status: 'available'
    },
    {
      id: 'crystal-maker',
      name: 'CrystalMaker Pro',
      description: 'Crystal and molecular structures visualization and building',
      applications: ['Crystallography', 'Diffraction patterns', 'Powder averaging'],
      status: 'available'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* DFT Codes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">💎</span> First-Principles DFT Codes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dftCodes.map((code) => (
            <Card key={code.id} className="hover:shadow-lg transition-shadow border-indigo-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{code.name}</CardTitle>
                    <CardDescription className="mt-1">{code.description}</CardDescription>
                  </div>
                  <Badge variant={code.license === 'Open Source (GPL)' ? 'default' : 'secondary'}
                        className={code.license === 'Open Source (GPL)' ? 'bg-green-600' : 'bg-purple-500'}>
                    {code.license}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3">{code.category}</Badge>
                <div className="flex flex-wrap gap-1 mb-3">
                  {code.features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
                <Button className="w-full" size="sm" variant="outline">
                  Launch Calculation →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Materials Properties Calculator */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🔬</span> Materials Properties Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialsProperties.map((prop) => (
            <Card key={prop.property} className="cursor-pointer hover:shadow-md transition-all bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{prop.icon}</span>
                  <h4 className="font-semibold">{prop.property}</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {prop.methods.map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">{method}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Nanotechnology Tools */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🔮</span> Nanotechnology & Device Simulation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nanotechTools.map((tool) => (
            <Card key={tool.id} className={!tool.available ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Applications:</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tool.applications.map((app) => (
                    <Badge key={app} variant="secondary" className="text-xs">{app}</Badge>
                  ))}
                </div>
                <Button className="w-full" size="sm" disabled={!tool.available}>
                  Use Tool →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm opacity-90">DFT Codes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">6</p>
            <p className="text-sm opacity-90">Property Types</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm opacity-90">Nano Tools</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">∞</p>
            <p className="text-sm opacity-90">Core Hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ ASTRONOMY & ASTROPHYSICS SECTION ============

function AstronomySection() {
  const [telescopes] = useState([
    {
      id: 'jwst',
      name: 'JWST Archive',
      type: 'Space Telescope',
      wavelength: 'Infrared',
      dataVolume: '50 TB+',
      instruments: ['NIRCam', 'NIRSpec', 'MIRI', 'NIRISS'],
      status: 'active'
    },
    {
      id: 'hubble',
      name: 'Hubble Legacy Archive',
      type: 'Space Telescope',
      wavelength: 'UV/Optical/NIR',
      dataVolume: '200 TB+',
      instruments: ['WFC3', 'ACS', 'STIS', 'COS'],
      status: 'active'
    },
    {
      id: 'alma',
      name: 'ALMA Data',
      type: 'Radio Interferometer',
      wavelength: 'mm/sub-mm',
      dataVolume: '30 PB+',
      instruments: ['Array 12m', 'Array 7m', 'TP Array'],
      status: 'active'
    },
    {
      id: 'ska-preview',
      name: 'SKA Precursor Data',
      type: 'Radio Array',
      wavelength: 'Radio',
      dataVolume: '100 PB+ (projected)',
      instruments: ['ASKAP', 'MeerKAT'],
      status: 'coming_soon'
    }
  ]);

  const [analysisTools] = useState([
    {
      id: 'astropy-suite',
      name: 'Astropy Suite',
      category: 'Data Processing',
      description: 'Core astronomy library for Python with coordinate handling, FITS I/O, and more',
      features: ['FITS handling', 'Coordinate transforms', 'Cosmology', 'Tables/NDData'],
      language: 'Python'
    },
    {
      id: 'casa',
      name: 'CASA 6.5',
      category: 'Radio Astronomy',
      description: 'Common Astronomy Software Applications for radio interferometry data reduction',
      features: ['Calibration', 'Imaging', 'Mosaicking', 'VLBI support'],
      language: 'Python/C++'
    },
    {
      id: 'photutils',
      name: 'PhotUtils',
      category: 'Photometry',
      description: 'Tools for detection and photometry of astronomical sources',
      features: ['Source detection', 'Aperture photometry', 'PSF fitting', 'Background estimation'],
      language: 'Python'
    },
    {
      id: 'specutils',
      name: 'SpecUtils',
      category: 'Spectroscopy',
      description: 'Package for spectroscopic analysis of astronomical data',
      features: ['Line identification', 'Redshift measurement', 'Continuum fitting', 'Equivalent width'],
      language: 'Python'
    },
    {
      id: 'gadget-sim',
      name: 'GADGET-4',
      category: 'Cosmological Simulation',
      description: 'Code for cosmological N-body/SPH simulations',
      features: ['Gravity solver', 'SPH hydrodynamics', 'Black hole growth', 'TreePM method'],
      language: 'C/Fortran'
    },
    {
      id: 'yt-project',
      name: 'YT Project',
      category: 'Visualization & Analysis',
      description: 'Analyzing and visualizing volumetric data from astrophysical simulations',
      features: ['Volume rendering', 'Particle data', 'Adaptive mesh', 'Derived quantities'],
      language: 'Python'
    }
  ]);

  const [catalogs] = useState([
    { name: 'Gaia DR3', objects: '1.8 billion stars', type: 'Astrometry/Photometry', size: '1 TB' },
    { name: 'SDSS DR18', objects: '800 million objects', type: 'Imaging/Spectra', size: '150 TB' },
    { name: 'LSST Preview', objects: '37 billion (projected)', type: 'Time-domain imaging', size: '100 PB+' },
    { name: 'SIMBAD', objects: '13 million objects', type: 'Astronomical database', size: '50 GB' }
  ]);

  return (
    <div className="space-y-6">
      {/* Telescope Data Archives */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">📡</span> Observatory Data Archives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {telescopes.map((scope) => (
            <Card key={scope.id} className={`hover:shadow-lg transition-shadow ${scope.status === 'coming_soon' ? 'opacity-70 border-dashed' : 'border-sky-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{scope.name}</CardTitle>
                    <CardDescription className="mt-1">{scope.type} • {scope.wavelength}</CardDescription>
                  </div>
                  <Badge className={scope.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                    {scope.status === 'active' ? 'Active' : 'Coming Soon'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Volume:</span>
                    <span className="font-medium">{scope.dataVolume}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Instruments:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scope.instruments.map((inst) => (
                        <Badge key={inst} variant="secondary" className="text-xs">{inst}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full" size="sm" disabled={scope.status !== 'active'}>
                  Browse Archive →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Analysis Tools */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🔭</span> Astronomical Analysis Software
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysisTools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base group-hover:text-sky-600 transition-colors">{tool.name}</CardTitle>
                  <Badge variant="outline">{tool.language}</Badge>
                </div>
                <CardDescription className="text-sm">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-2">{tool.category}</Badge>
                <div className="flex flex-wrap gap-1">
                  {tool.features.slice(0, 3).map((f) => (
                    <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                  ))}
                </div>
                <Button className="w-full mt-3" size="sm" variant="outline">
                  Use Tool →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Astronomical Catalogs */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">⭐</span> Major Astronomical Catalogs
        </h3>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Catalog</th>
                    <th className="text-left p-3 text-sm font-medium">Objects</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Size</th>
                    <th className="text-left p-3 text-sm font-medium">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogs.map((cat, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{cat.name}</td>
                      <td className="p-3">{cat.objects}</td>
                      <td className="p-3"><Badge variant="outline">{cat.type}</Badge></td>
                      <td className="p-3 text-muted-foreground">{cat.size}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline">Query →</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ CLIMATE & EARTH SCIENCE SECTION ============

function ClimateScienceSection() {
  const [climateModels] = useState([
    {
      id: 'cesm2',
      name: 'CESM 2.1',
      category: 'Earth System Model',
      description: 'Community Earth System Model with fully coupled components',
      resolution: '1° / 0.25°',
      components: ['Atmosphere', 'Ocean', 'Land Ice', 'Sea Ice', 'River', 'Wave'],
      ensembleSize: 'Up to 100 members'
    },
    {
      id: 'wrf',
      name: 'WRF-ARW 4.5',
      category: 'Weather Research',
      description: 'Advanced Research WRF mesoscale numerical weather prediction',
      resolution: 'Down to 1 km',
      components: ['Data assimilation', 'Nested grids', 'Physics suites', 'Chemistry coupling'],
      ensembleSize: 'Forecast ensembles'
    },
    {
      id: 'mpas',
      name: 'MPAS-A 7.3',
      category: 'Global Model',
      description: 'Model for Prediction Across Scales - unstructured mesh atmosphere',
      resolution: 'Variable (3-120 km)',
      components: ['Unstructured mesh', 'Scale-aware physics', 'Regional/global', 'Ocean coupling'],
      ensembleSize: 'Configurable'
    },
    {
      id: 'roms',
      name: 'ROMS 4.0',
      category: 'Ocean Circulation',
      description: 'Regional Ocean Modeling System for coastal and basin-scale oceanography',
      resolution: '1-10 km typical',
      components: ['3D circulation', 'Biogeochemistry', 'Sediment transport', 'Data assimilation'],
      ensembleSize: 'Ensemble Kalman filter'
    }
  ]);

  const [earthObservation] = useState([
    {
      satellite: 'Sentinel-2',
      agency: 'ESA',
      resolution: '10m optical',
      revisit: '5 days',
      bands: '13 spectral',
      applications: ['Land cover', 'Vegetation', 'Water quality', 'Disaster response']
    },
    {
      satellite: 'Landsat 9',
      agency: 'NASA/USGS',
      resolution: '30m multispectral',
      revisit: '16 days',
      bands: '11 spectral',
      applications: ['Agriculture', 'Geology', 'Urban planning', 'Climate monitoring']
    },
    {
      satellite: 'MODIS',
      agency: 'NASA',
      resolution: '250m-1km',
      revisit: 'Daily',
      bands: '36 spectral',
      applications: ['Fire detection', 'Sea surface temp', 'Aerosols', 'Primary productivity']
    },
    {
      satellite: 'GRACE-FO',
      agency: 'NASA/DLR',
      resolution: '300 km footprint',
      revisit: 'Monthly',
      bands: 'Gravimetry',
      applications: ['Groundwater', 'Ice mass', 'Sea level change', 'Earthquake studies']
    }
  ]);

  const [gisTools] = useState([
    { name: 'GDAL/OGR', description: 'Geospatial data abstraction library', formatSupport: '200+ formats' },
    { name: 'QGIS Enterprise', description: 'Desktop & server GIS platform', formatSupport: 'All major' },
    { name: 'Google Earth Engine', description: 'Planetary-scale geospatial analysis', formatSupport: 'Cloud-native' },
    { name: 'WhiteboxTools', description: 'Advanced geospatial analysis', formatSupport: 'Raster/Vector' }
  ]);

  return (
    <div className="space-y-6">
      {/* Climate Models */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🌍</span> Climate & Weather Models
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {climateModels.map((model) => (
            <Card key={model.id} className="hover:shadow-lg transition-shadow border-teal-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{model.name}</CardTitle>
                    <CardDescription className="mt-1">{model.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-teal-100 text-teal-800">{model.resolution}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3">{model.category}</Badge>
                <div className="space-y-2 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground mb-1">Components:</p>
                    <div className="flex flex-wrap gap-1">
                      {model.components.map((comp) => (
                        <Badge key={comp} variant="secondary" className="text-xs">{comp}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ensemble Support:</span>
                    <span className="font-medium">{model.ensembleSize}</span>
                  </div>
                </div>
                <Button className="w-full" size="sm" variant="outline">
                  Configure Run →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Earth Observation Data */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🛰️</span> Satellite Earth Observation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earthObservation.map((sat) => (
            <Card key={sat.satellite} className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{sat.satellite}</CardTitle>
                  <Badge variant="outline">{sat.agency}</Badge>
                </div>
                <CardDescription>Resolution: {sat.resolution} • Revisit: {sat.revisit}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bands:</span>
                    <span className="font-medium">{sat.bands}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Applications:</p>
                    <div className="flex flex-wrap gap-1">
                      {sat.applications.slice(0, 3).map((app) => (
                        <Badge key={app} variant="secondary" className="text-xs">{app}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-3" size="sm">
                  Access Data →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* GIS & Geospatial Tools */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🗺️</span> GIS & Geospatial Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {gisTools.map((tool) => (
            <Card key={tool.name} className="cursor-pointer hover:shadow-md transition-shadow text-center">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-1">{tool.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
                <Badge variant="outline" className="text-xs">{tool.formatSupport}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ PHYSICS & ENGINEERING SIMULATIONS SECTION ============

function PhysicsSimulationsSection() {
  const [cfdSoftware] = useState([
    {
      id: 'openfoam',
      name: 'OpenFOAM v12',
      category: 'CFD',
      description: 'Open-source computational fluid dynamics toolbox',
      solvers: ['incompressible', 'compressible', 'multiphase', 'reacting', 'conjugate heat transfer'],
      meshTypes: ['Structured', 'Unstructured', 'Adaptive'],
      turbulenceModels: ['k-ε', 'k-ω SST', 'LES', 'DES'],
      parallelization: 'MPI (1000+ cores)'
    },
    {
      id: 'su2',
      name: 'SU2 7.5',
      category: 'Aerodynamics',
      description: 'SUite for Unsteady CFD and optimization',
      solvers: ['RANS', 'compressible Euler/NS', 'shape optimization', 'aeroelasticity'],
      meshTypes: ['Unstructured', 'Hybrid'],
      turbulenceModels: ['SA', 'SST', 'Transition models'],
      parallelization: 'MPI + GPU'
    }
  ]);

  const [feaSoftware] = useState([
    {
      id: 'fenics',
      name: 'FEniCSx',
      category: 'FEM Framework',
      description: 'Finite element computing platform with Python interface',
      elements: ['Lagrange', 'Nedelec', 'Raviart-Thomas', 'DG'],
      physics: ['Solid mechanics', 'Heat transfer', 'Electromagnetics', 'Multiphysics'],
      language: 'Python/C++'
    },
    {
      id: 'dealii',
      name: 'deal.II 9.5',
      category: 'FEM Library',
      description: 'Finite element library for PDE solving with adaptive meshes',
      elements: ['hp-adaptive', 'Matrix-free', 'GPU-accelerated'],
      physics: ['Structural', 'Fluid-structure', 'Coupled problems'],
      language: 'C++'
    },
    {
      id: 'moose',
      name: 'MOOSE',
      category: 'Multiphysics',
      description: 'Multiphysics Object Oriented Simulation Environment',
      elements: ['Finite volume', 'FEM', 'XFEM'],
      physics: ['Nuclear', 'Geomechanics', 'Chemical reactions', 'Phase field'],
      language: 'C++'
    }
  ]);

  const [specializedPhysics] = useState([
    {
      id: 'geant4',
      name: 'GEANT4 11.2',
      category: 'Particle Physics',
      description: 'Toolkit for Monte Carlo simulation of particle passage through matter',
      applications: ['Medical physics', 'High-energy physics', 'Space science', 'Radiation protection'],
      particles: '300+ particle types'
    },
    {
      id: 'flash',
      name: 'FLASH 4.7',
      category: 'Astrophysical Hydro',
      description: 'Modular code for solving compressible flow problems in astrophysics',
      applications: ['Supernovae', 'Stellar evolution', 'Galactic disks', 'Jet propagation'],
      dimensionality: '1D/2D/3D AMR'
    },
    {
      id: 'lammps-physics',
      name: 'LAMMPS Physics Packages',
      category: 'Condensed Matter',
      description: 'Classical MD with specialized packages for various physics',
      applications: ['Colloids', 'Granular', 'Coarse-graining', 'Peridynamics', 'SPH'],
      packages: 'USER-MISC, MOLECULE, KSPACE'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* CFD Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🌊</span> Computational Fluid Dynamics (CFD)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cfdSoftware.map((sw) => (
            <Card key={sw.id} className="hover:shadow-lg transition-shadow border-cyan-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{sw.name}</CardTitle>
                    <CardDescription className="mt-1">{sw.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">{sw.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Solvers:</p>
                    <div className="flex flex-wrap gap-1">
                      {sw.solvers.slice(0, 4).map((solver) => (
                        <Badge key={solver} variant="secondary" className="text-xs">{solver}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-muted-foreground">Turbulence:</span>
                      <p className="text-xs font-medium">{sw.turbulenceModels.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Scaling:</span>
                      <p className="text-xs font-medium">{sw.parallelization}</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm" variant="outline">
                  Setup Simulation →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FEA Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🏗️</span> Finite Element Analysis (FEA)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feaSoftware.map((sw) => (
            <Card key={sw.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{sw.name}</CardTitle>
                  <Badge variant="outline">{sw.language}</Badge>
                </div>
                <CardDescription>{sw.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-2">{sw.category}</Badge>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Elements:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sw.elements.map((el) => (
                        <Badge key={el} variant="outline" className="text-xs">{el}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Physics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sw.physics.slice(0, 3).map((phy) => (
                        <Badge key={phy} variant="outline" className="text-xs">{phy}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-3" size="sm" variant="outline">
                  Use Framework →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Specialized Physics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Specialized Physics Simulations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {specializedPhysics.map((sw) => (
            <Card key={sw.id} className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{sw.name}</CardTitle>
                  <Badge variant="secondary">{sw.category}</Badge>
                </div>
                <CardDescription>{sw.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Applications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sw.applications.map((app) => (
                        <Badge key={app} variant="outline" className="text-xs">{app}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {sw.particles && <span>• {sw.particles} supported</span>}
                    {sw.dimensionality && <span>• {sw.dimensionality}</span>}
                    {sw.packages && <span>• {sw.packages}</span>}
                  </div>
                </div>
                <Button className="w-full mt-3" size="sm" variant="outline">
                  Launch →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
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
            Unified scientific computing environment spanning Quantum Computing, HPC, AI, Life Sciences, 
            Chemistry, Materials, Astronomy, Climate Science, and Physics — all in one powerful platform.
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
            <Badge className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              🧬 Bioinformatics
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              🧪 Cheminformatics
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              🫧 Molecular Dynamics
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              💎 Materials Science
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
              📡 Astronomy
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-teal-500 to-green-500 text-white">
              🌍 Climate Science
            </Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-slate-500 to-gray-600 text-white">
              ⚡ Physics Sims
            </Badge>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-10 max-w-6xl mx-auto mb-8 h-auto gap-1">
            <TabsTrigger value="quantum" className="gap-1 py-2 text-xs" title="Quantum Computing">
              <span>⚛️</span><span className="hidden sm:inline">Quantum</span>
            </TabsTrigger>
            <TabsTrigger value="hpc" className="gap-1 py-2 text-xs" title="HPC Clusters">
              <span>🖥️</span><span className="hidden sm:inline">HPC</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1 py-2 text-xs" title="AI Platforms">
              <span>🤖</span><span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="bio" className="gap-1 py-2 text-xs" title="Bioinformatics">
              <span>🧬</span><span className="hidden sm:inline">Bio</span>
            </TabsTrigger>
            <TabsTrigger value="chem" className="gap-1 py-2 text-xs" title="Cheminformatics">
              <span>🧪</span><span className="hidden sm:inline">Chemo</span>
            </TabsTrigger>
            <TabsTrigger value="molecular" className="gap-1 py-2 text-xs" title="Molecular Dynamics">
              <span>🫧</span><span className="hidden sm:inline">MD</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-1 py-2 text-xs" title="Materials Science">
              <span>💎</span><span className="hidden sm:inline">MatSci</span>
            </TabsTrigger>
            <TabsTrigger value="astronomy" className="gap-1 py-2 text-xs" title="Astronomy">
              <span>📡</span><span className="hidden sm:inline">Astro</span>
            </TabsTrigger>
            <TabsTrigger value="climate" className="gap-1 py-2 text-xs" title="Climate Science">
              <span>🌍</span><span className="hidden sm:inline">Climate</span>
            </TabsTrigger>
            <TabsTrigger value="physics" className="gap-1 py-2 text-xs" title="Physics Sims">
              <span>⚡</span><span className="hidden sm:inline">Physics</span>
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

          <TabsContent value="molecular">
            <MolecularModellingSection />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsScienceSection />
          </TabsContent>

          <TabsContent value="astronomy">
            <AstronomySection />
          </TabsContent>

          <TabsContent value="climate">
            <ClimateScienceSection />
          </TabsContent>

          <TabsContent value="physics">
            <PhysicsSimulationsSection />
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

  const [domainUsage] = useState([
    { domain: 'Quantum Computing', jobs: 45, percentage: 3.6, color: 'purple' },
    { domain: 'HPC Clusters', jobs: 312, percentage: 25.0, color: 'blue' },
    { domain: 'AI Platforms', jobs: 287, percentage: 23.0, color: 'pink' },
    { domain: 'Bioinformatics', jobs: 198, percentage: 15.9, color: 'green' },
    { domain: 'Cheminformatics', jobs: 156, percentage: 12.5, color: 'amber' },
    { domain: 'Molecular Dynamics', jobs: 134, percentage: 10.7, color: 'cyan' },
    { domain: 'Materials Science', jobs: 67, percentage: 5.4, color: 'indigo' },
    { domain: 'Astronomy', jobs: 28, percentage: 2.2, color: 'sky' },
    { domain: 'Climate Science', jobs: 15, percentage: 1.2, color: 'teal' },
    { domain: 'Physics Sims', jobs: 5, percentage: 0.4, color: 'slate' }
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

      {/* Domain Usage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scientific Domain Distribution</CardTitle>
          <CardDescription>Job distribution across all computing domains today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {domainUsage.map((domain) => (
              <div key={domain.domain} className="flex items-center gap-3">
                <span className="text-sm font-medium w-40 truncate">{domain.domain}</span>
                <div className="flex-1">
                  <Progress value={domain.percentage * 10} className="h-3" />
                </div>
                <span className="text-sm text-muted-foreground w-16 text-right">{domain.jobs} ({domain.percentage}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resource Utilization */}
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

        {/* Recent Activity */}
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
                <p className="text-sm text-muted-foreground">No reported outages or degraded performance across all 10 scientific domains</p>
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
