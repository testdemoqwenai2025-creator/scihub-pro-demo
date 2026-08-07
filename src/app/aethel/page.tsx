'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

// ============ TYPES ============

interface AIModel {
  id: string;
  name: string;
  type: 'llm' | 'vision' | 'multimodal' | 'quantum' | 'scientific';
  parameters: string;
  speed: string;
  description: string;
  status: 'available' | 'busy' | 'offline';
  specialty: string;
}

interface JobSubmission {
  prompt: string;
  modelId: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  computeBudget: number;
}

interface CompletedJob {
  id: string;
  model: string;
  prompt: string;
  result: string;
  timestamp: Date;
  computeTime: number;
  tokensUsed: number;
}

// ============ AI MODELS ============

const aiModels: AIModel[] = [
  {
    id: 'gpt-turbo-220b',
    name: 'GPT-Turbo 220B',
    type: 'llm',
    parameters: '220B',
    speed: '45K tok/s',
    description: 'General-purpose reasoning for literature analysis and hypothesis generation',
    status: 'available',
    specialty: 'Natural Language Processing',
  },
  {
    id: 'vision-pro-85b',
    name: 'Vision Pro 85B',
    type: 'vision',
    parameters: '85B',
    speed: '120 img/s',
    description: 'Advanced image analysis for microscopy and medical imaging interpretation',
    status: 'available',
    specialty: 'Computer Vision',
  },
  {
    id: 'quantum-sim-150b',
    name: 'Quantum Sim 150B',
    type: 'quantum',
    parameters: '150B',
    speed: '2.3M qubits/s',
    description: 'Quantum chemistry simulations and molecular dynamics optimization',
    status: 'available',
    specialty: 'Quantum Chemistry',
  },
  {
    id: 'bio-intel-300b',
    name: 'Bio Intel 300B',
    type: 'scientific',
    parameters: '300B',
    speed: '38K tok/s',
    description: 'Specialized bioinformatics model for genomics and drug discovery pipelines',
    status: 'busy',
    specialty: 'Bioinformatics & Drug Discovery',
  },
  {
    id: 'multimodal-300b',
    name: 'MultiModal 300B',
    type: 'multimodal',
    parameters: '300B',
    speed: '32K mixed/s',
    description: 'Cross-modal analysis combining text, images, and structured data',
    status: 'available',
    specialty: 'Multi-Modal Fusion',
  },
];

// ============ QUICK TEMPLATES ============

const quickTemplates = [
  {
    id: 'lit-review',
    name: 'Literature Review',
    prompt: 'Generate a comprehensive literature review on [TOPIC] focusing on recent advances (2022-2024), key methodologies, and future directions. Include at least 15 relevant papers with DOI references.',
    icon: '📚',
  },
  {
    id: 'hypothesis',
    name: 'Hypothesis Generation',
    prompt: 'Based on the following observation: [OBSERVATION], generate 5 testable hypotheses with proposed experimental designs, expected outcomes, and potential implications.',
    icon: '💡',
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Plan',
    prompt: 'Design a comprehensive data analysis plan for [DATA_TYPE] dataset. Include statistical methods, visualization approaches, validation strategies, and reproducibility considerations.',
    icon: '📊',
  },
  {
    id: 'method-suggestion',
    name: 'Method Suggestion',
    prompt: 'For the research question: "[QUESTION]", suggest and compare 3 methodological approaches. Include pros/cons, computational requirements, and recommended tools/libraries.',
    icon: '🔬',
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    prompt: 'Generate production-ready Python code for: [TASK]. Include error handling, documentation, type hints, and example usage. Follow PEP 8 and best practices.',
    icon: '💻',
  },
];

// ============ AETHEL PAGE ============

export default function AETHELPage() {
  const { t } = useTranslation();
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    latency: 0,
    uptime: '99.97%',
    version: '2.4.1',
    computeUnits: 128,
    queueDepth: 7,
    activeJobs: 23,
  });

  // Job state
  const [selectedModel, setSelectedModel] = useState(aiModels[0].id);
  const [prompt, setPrompt] = useState('');
  const [priority, setPriority] = useState<JobSubmission['priority']>('normal');
  const [computeBudget, setComputeBudget] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results state
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [showResults, setShowResults] = useState(true);

  // Metrics state (simulated live)
  const [metrics, setMetrics] = useState({
    computeUtilization: 67,
    memoryUsage: 54,
    gpuUsage: 78,
    networkIO: 42,
  });

  // Connect to AETHEL
  const connectToAETHEL = useCallback(async () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConnected(true);
    setIsConnecting(false);
  }, []);

  // Disconnect
  const disconnectFromAETHEL = useCallback(() => {
    setIsConnected(false);
  }, []);

  // Submit job
  const submitJob = async () => {
    if (!prompt.trim()) return;

    setIsSubmitting(true);

    // Simulate job execution
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 4000));

    const model = aiModels.find(m => m.id === selectedModel)!;
    const newJob: CompletedJob = {
      id: `job-${Date.now()}`,
      model: model.name,
      prompt,
      result: generateMockResponse(model.type, prompt),
      timestamp: new Date(),
      computeTime: parseFloat((3 + Math.random() * 4).toFixed(2)),
      tokensUsed: Math.floor(1000 + Math.random() * 5000),
    };

    setCompletedJobs(prev => [newJob, ...prev.slice(0, 9)]);
    setPrompt('');
    setIsSubmitting(false);
  };

  // Generate mock response based on model type
  const generateMockResponse = (type: AIModel['type'], userPrompt: string): string => {
    const responses: Record<AIModel['type'], string[]> = {
      lll: [
        `## Literature Analysis Complete\n\nBased on your query about "${userPrompt.slice(0, 50)}...", I've analyzed 847 relevant publications from 2022-2024.\n\n### Key Findings:\n\n1. **Recent Advances**: The field has seen significant progress in methodology, with deep learning approaches showing 34% improvement over traditional methods.\n\n2. **Methodological Trends**: Transformer-based architectures dominate current research, with 68% of recent papers utilizing attention mechanisms.\n\n3. **Future Directions**: Emerging areas include multimodal integration and few-shot learning applications.\n\n### Recommended Papers:\n\n| DOI | Citation Count | Key Contribution |\n|-----|---------------|------------------|\n| 10.5555/paper001 | 234 | Novel architecture design |\n| 10.5555/paper002 | 189 | Benchmark dataset creation |\n| 10.5555/paper003 | 156 | Cross-domain evaluation |\n\n**Confidence Score**: 94%`,
      ],
      vision: [
        `## Image Analysis Report\n\nI've processed your microscopy image using advanced computer vision techniques.\n\n### Detection Results:\n\n- **Cell Count**: 1,247 cells detected (confidence: 96.3%)\n- **Classification**: 892 healthy, 355 apoptotic (28.5% apoptosis rate)\n- **Morphology**: Average cell area = 245 μm² (SD ± 42)\n\n### Key Observations:\n\n1. **Nuclear Morphology**: Irregular nuclear envelopes observed in 23% of cells\n2. **Organelle Distribution**: Mitochondrial clustering in perinuclear region\n3. **Membrane Integrity**: 94% of cells show intact plasma membranes\n\n### Recommendations:\n\nConsider additional staining for confirmation of apoptotic markers (caspase-3, Annexin V).`,
      ],
      quantum: [
        `## Quantum Simulation Results\n\nComputation completed using hybrid quantum-classical algorithm.\n\n### System Properties:\n\n- **Total Energy**: -1247.83 Hartree (±0.02)\n- **Optimized Geometry**: Converged after 127 iterations\n- **Electronic Structure**: HOMO-LUMO gap = 4.23 eV\n\n### Molecular Orbitals:\n\n| Orbital | Energy (eV) | Character |\n|---------|------------|----------|\n| HOMO | -6.82 | π-bonding |\n| LUMO | -2.59 | π*-antibonding |\n| HOMO-1 | -7.41 | σ-bonding |\n\n### Vibrational Frequencies:\n\nIdentified 3N-6 = 45 vibrational modes.\nLowest frequency: 87 cm⁻¹ (torsional mode)\nHighest frequency: 3245 cm⁻¹ (O-H stretch)\n\n**Simulation Time**: 2.47 hours on 64-qubit system`,
      ],
      scientific: [
        `## Bioinformatics Analysis Pipeline\n\nExecuting specialized bioinformatics workflow...\n\n### Sequence Analysis:\n\n- **Input Sequence**: ${userPrompt.slice(0, 30)}... (${Math.floor(Math.random() * 50000 + 1000)} bp)\n- **GC Content**: ${(45 + Math.random() * 20).toFixed(1)}%\n- **Complexity Score**: High (entropy = 1.92 bits/base)\n\n### Annotation Results:\n\n| Feature | Position | Score | Function |\n|---------|----------|-------|----------|\n| Promoter | 1-234 | 0.98 | TATA box region |\n| CDS | 235-1523 | 0.99 | Protein coding |\n| Poly-A signal | 1498-1503 | 0.95 | Transcription end |\n\n### Variant Calling:\n\nDetected ${Math.floor(Math.random() * 10 + 1)} variants:\n- ${Math.floor(Math.random() * 5)} missense mutations\n- ${Math.floor(Math.random() * 3)} synonymous variants\n- 1 potential splice site variant\n\n**Recommended Next Steps**: Validate top candidates via Sanger sequencing.`,
      ],
      multimodal: [
        `## Multi-Modal Integration Analysis\n\nSynthesizing information across text, image, and structured data modalities.\n\n### Integrated Insights:\n\n**Text Analysis**: Your query relates to molecular interactions with high confidence (0.93).\n\n**Image Correlation**: Structural data shows binding pocket compatibility score of 0.87.\n\n**Database Cross-Reference**: Found 23 related entries in ChEMBL, 12 in PubChem.\n\n### Unified Conclusion:\n\nThe multi-modal evidence strongly suggests:\n\n1. ✅ **Feasibility**: High probability of successful interaction\n2. ⚠️ **Considerations**: Potential off-target effects at concentration >10μM\n3. 📊 **Recommendation**: Proceed to in vitro validation with suggested assay conditions\n\n**Cross-Modal Confidence**: 89%`,
      ],
    };

    return responses[type]?.[0] || responses.lll[0];
  };

  // Simulate live metrics
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        computeUtilization: Math.max(30, Math.min(95, prev.computeUtilization + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(40, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        gpuUsage: Math.max(50, Math.min(99, prev.gpuUsage + (Math.random() - 0.5) * 8)),
        networkIO: Math.max(20, Math.min(80, prev.networkIO + (Math.random() - 0.5) * 12)),
      }));

      setConnectionStatus(prev => ({
        ...prev,
        queueDepth: Math.max(0, prev.queueDepth + Math.floor(Math.random() * 3) - 1),
        activeJobs: Math.max(15, Math.min(35, prev.activeJobs + Math.floor(Math.random() * 3) - 1)),
        latency: Math.floor(12 + Math.random() * 25),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('aethel.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('aethel.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Job Submission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t('aethel.connection_status')}</CardTitle>
                <Badge 
                  variant={isConnected ? 'default' : isConnecting ? 'secondary' : 'outline'}
                  className={isConnected ? 'bg-green-500' : ''}
                >
                  {isConnected ? t('aethel.connected') : isConnecting ? t('aethel.connecting') : t('aethel.disconnected')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <Button 
                  onClick={connectToAETHEL} 
                  disabled={isConnecting}
                  className="w-full"
                  size="lg"
                >
                  {isConnecting ? '⏳ Connecting...' : '🔌 Connect to AETHEL'}
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Status Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t('aethel.latency')}</p>
                      <p className="text-xl font-bold">{connectionStatus.latency}ms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t('aethel.compute_units')}</p>
                      <p className="text-xl font-bold">{connectionStatus.computeUnits}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t('aethel.queue_depth')}</p>
                      <p className="text-xl font-bold">{connectionStatus.queueDepth}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t('aethel.active_jobs')}</p>
                      <p className="text-xl font-bold">{connectionStatus.activeJobs}</p>
                    </div>
                  </div>

                  <Button onClick={disconnectFromAETHEL} variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Selection & Job Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('aethel.models')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    disabled={model.status === 'offline'}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedModel === model.id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'hover:border-primary/50'
                    } ${model.status === 'offline' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm">{model.name}</span>
                      <Badge 
                        variant={model.status === 'available' ? 'default' : 'secondary'}
                        className={model.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'}
                      >
                        {model.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{model.parameters} params</span>
                      <span>•</span>
                      <span>{model.speed}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('aethel.job_prompt')}</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your computational task or research question..."
                  rows={4}
                  disabled={!isConnected}
                />
              </div>

              {/* Quick Templates */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('aethel.quick_templates')}</label>
                <div className="flex flex-wrap gap-2">
                  {quickTemplates.map(template => (
                    <Button
                      key={template.id}
                      size="sm"
                      variant="outline"
                      onClick={() => setPrompt(template.prompt)}
                      disabled={!isConnected}
                      title={template.name}
                    >
                      {template.icon} {template.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">{t('aethel.priority')}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as JobSubmission['priority'])}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                    disabled={!isConnected}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">{t('aethel.compute_budget')} (hours)</label>
                  <Input
                    type="number"
                    value={computeBudget}
                    onChange={(e) => setComputeBudget(Number(e.target.value))}
                    min={1}
                    max={100}
                    disabled={!isConnected}
                  />
                </div>
              </div>

              {/* Submit */}
              <Button 
                onClick={submitJob} 
                disabled={!isConnected || !prompt.trim() || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? '⏳ Processing...' : '🚀 Submit to AETHEL'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results & Metrics */}
        <div className="space-y-6">
          {/* Live Metrics */}
          {isConnected && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Live Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Compute Utilization</span>
                    <span>{Math.round(metrics.computeUtilization)}%</span>
                  </div>
                  <Progress value={metrics.computeUtilization} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{Math.round(metrics.memoryUsage)}%</span>
                  </div>
                  <Progress value={metrics.memoryUsage} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>GPU Usage</span>
                    <span>{Math.round(metrics.gpuUsage)}%</span>
                  </div>
                  <Progress value={metrics.gpuUsage} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Network I/O</span>
                    <span>{Math.round(metrics.networkIO)}%</span>
                  </div>
                  <Progress value={metrics.networkIO} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results History */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('aethel.results_history')}</CardTitle>
                <Switch checked={showResults} onCheckedChange={setShowResults} />
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-auto space-y-3">
              {completedJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('aethel.no_results')}
                </p>
              ) : (
                completedJobs.map(job => (
                  <div key={job.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-sm">{job.model}</span>
                      <Badge variant="outline" className="text-xs">
                        {job.tokensUsed.toLocaleString()} tokens
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {job.prompt}
                    </p>
                    
                    <div className="bg-muted/50 rounded p-2 max-h-40 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {job.result.length > 500 
                          ? job.result.substring(0, 500) + '...' 
                          : job.result
                        }
                      </pre>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t('aethel.compute_time')}: {job.computeTime}s</span>
                      <span>{job.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
