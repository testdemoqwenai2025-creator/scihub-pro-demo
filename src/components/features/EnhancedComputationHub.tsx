'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

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
    }
  ]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">⚛️</span> Quantum Processing Units (QPUs)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quantumBackends.map((backend) => (
          <Card key={backend.id} className={`border-2 ${
            backend.status === 'available' ? 'border-green-200 bg-green-50/50' : 'border-yellow-200'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{backend.name}</CardTitle>
                <Badge className={backend.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'}>
                  {backend.status}
                </Badge>
              </div>
              <CardDescription>{backend.type} • {backend.qubits} Qubits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Queue:</span><span className="font-medium">{backend.queueTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span><span className="font-medium">{backend.errorRate}</span>
                </div>
              </div>
              <Button className="w-full mt-3" size="sm" variant="outline">Launch →</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">212</p>
            <p className="text-sm opacity-90">Total Qubits</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm opacity-90">QPUs Online</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
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
    { name: 'Alpha Cluster', nodes: 1024, cores: 16384, gpuNodes: 128, memory: '64TB', utilization: 78 },
    { name: 'Beta Cluster', nodes: 512, cores: 8192, gpuNodes: 64, memory: '32TB', utilization: 45 },
    { name: 'Gamma GPU', nodes: 256, cores: 4096, gpuNodes: 256, memory: '16TB', utilization: 92 }
  ]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🖥️</span> HPC Infrastructure
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusters.map((cluster, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{cluster.name}</CardTitle>
              <Badge className={cluster.utilization > 80 ? 'bg-red-500' : cluster.utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'}>
                {cluster.utilization}% Used
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-muted-foreground">Nodes</p><p className="font-bold">{cluster.nodes.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Cores</p><p className="font-bold">{cluster.cores.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">GPUs</p><p className="font-bold">{cluster.gpuNodes}</p></div>
                <div><p className="text-muted-foreground">Memory</p><p className="font-bold">{cluster.memory}</p></div>
              </div>
              <Progress value={cluster.utilization} className="mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">⚡ Submit HPC Job</h3>
            <p className="text-slate-300 text-sm">Access 28,672+ cores across our infrastructure</p>
          </div>
          <Button className="bg-white text-black hover:bg-slate-200">Launch →</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ AI PLATFORMS SECTION ============

function AIPlatformsSection() {
  const [aiModels] = useState([
    { name: 'GPT-4 Turbo', provider: 'OpenAI', context: '128K tokens', available: true },
    { name: 'Claude 3 Opus', provider: 'Anthropic', context: '200K tokens', available: true },
    { name: 'Llama 3 400B', provider: 'Meta', context: '128K tokens', available: true },
    { name: 'Gemini Ultra', provider: 'Google', context: '1M tokens', available: false }
  ]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🤖</span> AI Model Hub
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiModels.map((model, idx) => (
          <Card key={idx} className={!model.available ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{model.name}</CardTitle>
                  <CardDescription>{model.provider}</CardDescription>
                </div>
                <Badge className={model.available ? 'bg-green-500' : 'bg-gray-400'}>
                  {model.available ? 'Online' : 'Maintenance'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm"><span className="text-muted-foreground">Context:</span> {model.context}</p>
              <Button className="w-full mt-3" size="sm" disabled={!model.available}>Use Model →</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4 cursor-pointer hover:shadow-md"><p className="text-2xl mb-1">🧠</p><p className="font-medium text-sm">Fine-Tuning</p></Card>
        <Card className="text-center p-4 cursor-pointer hover:shadow-md"><p className="text-2xl mb-1">📊</p><p className="font-medium text-sm">Inference API</p></Card>
        <Card className="text-center p-4 cursor-pointer hover:shadow-md"><p className="text-2xl mb-1">🔄</p><p className="font-medium text-sm">AutoML</p></Card>
      </div>
    </div>
  );
}

// ============ BIOINFORMATICS & CHEMINFORMATICS SECTION ============

function LifeSciencesSection() {
  const [bioTools] = useState([
    { name: 'GATK 5.0', category: 'Genomics', desc: 'Variant discovery pipeline' },
    { name: 'BLAST+', category: 'Sequence Analysis', desc: 'Local alignment search' },
    { name: 'AlphaFold 3', category: 'Structure Prediction', desc: 'AI protein folding' },
    { name: 'Bowtie 2', category: 'Alignment', desc: 'Short-read alignment' }
  ]);

  const [chemTools] = useState([
    { name: 'RDKit', category: 'Cheminformatics', desc: 'Molecular manipulation toolkit' },
    { name: 'AutoDock Vina', category: 'Molecular Docking', desc: 'Virtual screening engine' },
    { name: 'GROMACS', category: 'MD Simulation', desc: 'High-performance MD solver' },
    { name: 'QSAR Modeler', category: 'Drug Discovery', desc: 'Activity prediction ML' }
  ]);

  return (
    <div className="space-y-6">
      {/* Bioinformatics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🧬</span> Bioinformatics Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {bioTools.map((tool, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm">{tool.name}</h4>
                <Badge variant="outline" className="my-1 text-xs">{tool.category}</Badge>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
                <Button className="w-full mt-2" size="sm" variant="outline">Launch →</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cheminformatics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🧪</span> Cheminformatics & Drug Discovery
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {chemTools.map((tool, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm">{tool.name}</h4>
                <Badge variant="outline" className="my-1 text-xs">{tool.category}</Badge>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
                <Button className="w-full mt-2" size="sm" variant="outline">Use Tool →</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">8+</p>
            <p className="text-sm opacity-90">Life Science Tools</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm opacity-90">Chem Databases</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-sm opacity-90">Availability</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ MATERIALS & PHYSICS SECTION ============

function MaterialsPhysicsSection() {
  const [dftCodes] = useState([
    { name: 'VASP 6.5', type: 'DFT', license: 'Commercial', desc: 'Industry standard DFT code' },
    { name: 'Quantum ESPRESSO', type: 'DFT', license: 'Open Source', desc: 'Electronic structure calculations' },
    { name: 'CP2K 2024', type: 'DFT/MM', license: 'Open Source', desc: 'Mixed Gaussian/plane waves' }
  ]);

  const [simTools] = useState([
    { name: 'OpenFOAM', category: 'CFD', desc: 'Computational fluid dynamics' },
    { name: 'FEniCSx', category: 'FEA', desc: 'Finite element analysis' },
    { name: 'LAMMPS', category: 'MD', desc: 'Classical molecular dynamics' },
    { name: 'GEANT4', category: 'Particle Physics', desc: 'Monte Carlo simulation' }
  ]);

  return (
    <div className="space-y-6">
      {/* Materials Science */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">💎</span> Materials Science (DFT)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dftCodes.map((code, idx) => (
            <Card key={idx} className="border-indigo-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{code.name}</CardTitle>
                  <Badge className={code.license === 'Open Source' ? 'bg-green-600' : 'bg-purple-500'}>
                    {code.license}
                  </Badge>
                </div>
                <CardDescription>{code.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{code.type}</Badge>
                <Button className="w-full mt-3" size="sm" variant="outline">Configure →</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Physics Simulations */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Physics Simulations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {simTools.map((tool, idx) => (
            <Card key={idx} className="hover:shadow-md">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm">{tool.name}</h4>
                <Badge variant="secondary" className="my-1 text-xs">{tool.category}</Badge>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
                <Button className="w-full mt-2" size="sm" variant="outline">Launch →</Button>
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
  const [activeTab, setActiveTab] = useState('quantum');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50/50 to-background dark:via-slate-950/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">⚡</span>
            <h1 className="text-3xl md:text-4xl font-bold">Enhanced Computation Hub</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Unified scientific computing environment for Quantum, HPC, AI, Life Sciences, and Materials Research.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">⚛️ Quantum Ready</Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">🖥️ 28K+ Cores</Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">🤖 AI Models</Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">🧬 Life Sciences</Badge>
            <Badge className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">💎 Materials</Badge>
          </div>
        </div>

        {/* Main Content Tabs - Simplified to 5 tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto mb-8 h-12 grid-cols-5">
            <TabsTrigger value="quantum" className="gap-2">
              <span>⚛️</span><span className="hidden sm:inline">Quantum</span>
            </TabsTrigger>
            <TabsTrigger value="hpc" className="gap-2">
              <span>🖥️</span><span className="hidden sm:inline">HPC</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <span>🤖</span><span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="life" className="gap-2">
              <span>🧬</span><span className="hidden sm:inline">Life Sciences</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <span>💎</span><span className="hidden sm:inline">Materials</span>
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

          <TabsContent value="life">
            <LifeSciencesSection />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsPhysicsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
