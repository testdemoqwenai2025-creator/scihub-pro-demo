'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore, createDynamicField } from '@/store/useDynamicStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============ TYPES ============

interface AIModel {
  id: string;
  name: string;
  type: 'llm' | 'vision' | 'quantum' | 'scientific' | 'multimodal';
  parameters: string;
  speed: string; // tokens/sec
  specialty: string;
  isAvailable: boolean;
  maxContext: number; // tokens
}

interface PromptHistory {
  id: string;
  prompt: string;
  model: string;
  response?: string;
  tokensUsed: number;
  computeTime: number;
  priority: string;
  timestamp: Date;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

interface SystemMetrics {
  computeUtilization: number;
  memoryUsage: number;
  gpuUsage: number;
  networkIO: number;
  activeJobs: number;
  queueDepth: number;
}

// ============ AI MODELS ============

const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-turbo-220b',
    name: 'GPT-Turbo 220B',
    type: 'llm',
    parameters: '220B',
    speed: '45K tokens/s',
    specialty: 'General reasoning & analysis',
    isAvailable: true,
    maxContext: 128000,
  },
  {
    id: 'vision-pro-85b',
    name: 'Vision Pro 85B',
    type: 'vision',
    parameters: '85B',
    speed: '28K tokens/s',
    specialty: 'Image & video understanding',
    isAvailable: true,
    maxContext: 64000,
  },
  {
    id: 'quantum-sim-150b',
    name: 'Quantum Sim 150B',
    type: 'quantum',
    parameters: '150B',
    speed: '12K tokens/s',
    specialty: 'Quantum chemistry simulation',
    isAvailable: false,
    maxContext: 32000,
  },
  {
    id: 'bio-intel-300b',
    name: 'Bio Intel 300B',
    type: 'scientific',
    parameters: '300B',
    speed: '35K tokens/s',
    specialty: 'Biomedical & genomics analysis',
    isAvailable: true,
    maxContext: 96000,
  },
  {
    id: 'multimodal-300b',
    name: 'MultiModal 300B',
    type: 'multimodal',
    parameters: '300B',
    speed: '32K tokens/s',
    specialty: 'Cross-modal scientific reasoning',
    isAvailable: true,
    maxContext: 128000,
  },
];

// ============ PROMPT TEMPLATES ============

const PROMPT_TEMPLATES = [
  {
    id: 'lit-review',
    name: 'Literature Review',
    template: `Generate a comprehensive literature review on [TOPIC]. Include:
1. Recent advances (2022-2024)
2. Key methodologies
3. Major findings and controversies
4. Future directions
5. Critical analysis of the field

Focus on peer-reviewed sources and provide citations where possible.`,
  },
  {
    id: 'hypothesis',
    name: 'Hypothesis Generation',
    template: `Based on the following observation: [OBSERVATION]

Generate 3 testable hypotheses that could explain this phenomenon. For each hypothesis:
1. State the hypothesis clearly
2. Identify key variables
3. Suggest experimental approaches
4. Predict potential outcomes
5. Discuss implications if confirmed`,
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Plan',
    template: `I have a dataset with the following characteristics:
- Type: [DATA_TYPE]
- Size: [SIZE]
- Variables: [VARIABLES]
- Research question: [QUESTION]

Design a comprehensive data analysis plan including:
1. Data preprocessing steps
2. Statistical methods to apply
3. Visualization strategy
4. Validation approach
5. Potential pitfalls and how to address them`,
  },
  {
    id: 'method-suggestion',
    name: 'Method Suggestion',
    template: `I'm trying to: [GOAL]
With the following constraints: [CONSTRAINTS]

Suggest the most appropriate computational/experimental methods to achieve this goal. Consider:
1. Current state-of-the-art approaches
2. Computational requirements
3. Data availability needs
4. Validation strategies
5. Alternative approaches if primary method fails`,
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    template: `Generate [LANGUAGE] code for the following task:

[TASK_DESCRIPTION]

Requirements:
1. Include proper error handling
2. Add comments explaining key steps
3. Use best practices for [DOMAIN]
4. Include example usage
5. Suggest optimizations if applicable`,
  },
];

// ============ AETHEL PAGE ============

export default function AETHELPage() {
  const { t } = useTranslation();
  const {
    aethelPrompts,
    submitPrompt,
    clearPromptHistory,
    addActivity,
  } = useDynamicStore();

  // UI State
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [promptText, setPromptText] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'critical'>('normal');
  const [computeBudget, setComputeBudget] = useState(50); // percentage
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);

  // Metrics (simulated)
  const [metrics, setMetrics] = useState<SystemMetrics>({
    computeUtilization: 0,
    memoryUsage: 0,
    gpuUsage: 0,
    networkIO: 0,
    activeJobs: 0,
    queueDepth: 0,
  });

  // Update metrics periodically when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setMetrics({
        computeUtilization: Math.min(100, 20 + Math.random() * 60 + (isProcessing ? 30 : 0)),
        memoryUsage: Math.min(100, 40 + Math.random() * 30),
        gpuUsage: Math.min(100, isProcessing ? 70 + Math.random() * 25 : 10 + Math.random() * 20),
        networkIO: Math.min(100, Math.random() * 40),
        activeJobs: aethelPrompts.filter(p => p.status === 'processing').length,
        queueDepth: aethelPrompts.filter(p => p.status === 'queued').length,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected, isProcessing, aethelPrompts]);

  // Handle connection toggle
  const handleToggleConnection = async () => {
    if (isConnected) {
      setIsConnected(false);
      setConnectionLatency(null);
      addActivity({
        type: 'disconnect',
        message: createDynamicField('Disconnected from AETHEL AI'),
        icon: '🔌',
      });
    } else {
      // Simulate connection
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
      
      setIsConnected(true);
      setConnectionLatency(Math.floor(15 + Math.random() * 35));
      setIsProcessing(false);

      addActivity({
        type: 'connect',
        message: createDynamicField(`Connected to AETHEL AI (${connectionLatency}ms latency)`),
        icon: '🤖',
      });
    }
  };

  // Handle prompt submission
  const handleSubmitPrompt = async () => {
    if (!promptText.trim() || !isConnected) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentResponse('');

    // Create prompt entry
    submitPrompt({
      prompt: createDynamicField(promptText),
      model: createDynamicField(selectedModel),
      tokensUsed: createDynamicField(0),
      computeTime: createDynamicField(0),
      priority: createDynamicField(priority),
      computeBudget: createDynamicField(computeBudget),
    });

    // Simulate processing progress
    const totalTime = 3000 + Math.random() * 4000;
    const startTime = Date.now();

    while (Date.now() - startTime < totalTime) {
      const elapsed = Date.now() - startTime;
      setProcessingProgress(Math.min(95, (elapsed / totalTime) * 90));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Generate mock response based on model type
    const model = AI_MODELS.find(m => m.id === selectedModel)!;
    const response = generateMockResponse(model.type, promptText);
    
    setCurrentResponse(response);
    setProcessingProgress(100);

    // Update the prompt in history with results
    const prompts = useDynamicStore.getState().aethelPrompts;
    if (prompts.length > 0) {
      const lastPrompt = prompts[0];
      // Response would be updated in store in real implementation
    }

    setIsProcessing(false);

    addActivity({
      type: 'compute',
      message: createDynamicField(`AETHEL ${model.name} completed analysis`),
      icon: '✨',
    });
  };

  // Generate mock response based on model type
  const generateMockResponse = (type: AIModel['type'], prompt: string): string => {
    switch (type) {
      case 'llm':
        return `## Analysis Complete

Based on your query about "${prompt.substring(0, 50)}...", here's my comprehensive analysis:

### Key Findings

1. **Primary Insight**: The data suggests significant patterns that warrant further investigation. Current research indicates multiple factors contribute to the observed phenomenon.

2. **Supporting Evidence**: 
   - Recent studies (2023-2024) show consistent results across different methodologies
   - Meta-analyses confirm statistical significance (p < 0.001)
   - Effect sizes range from moderate to large (Cohen's d > 0.5)

3. **Methodological Considerations**:
   - Sample size adequacy confirmed
   - Potential confounding variables identified
   - Recommendations for replication studies provided

### Recommendations

1. **Immediate Actions**: Validate findings with independent dataset
2. **Short-term**: Expand scope to include additional variables
3. **Long-term**: Develop predictive models based on identified patterns

### References

This analysis draws upon current literature and established methodologies. Full citation list available upon request.

---
*Generated by GPT-Turbo 220B • Tokens: ~1,250 • Confidence: High*`;

      case 'scientific':
        return `## Scientific Analysis Results

### Query: "${prompt.substring(0, 60)}..."

### Biological Interpretation

**Gene/Protein Analysis**:
- Identified 23 significant variants (p < 5e-8)
- Pathway enrichment observed in MAPK signaling cascade
- Conservation score: 0.89 (highly conserved across species)

**Structural Insights**:
- Predicted binding affinity: ΔG = -8.2 kcal/mol
- Active site residues: HIS41, CYS145, MET165
- Solvent accessibility: 45% (partially exposed)

### Statistical Summary

| Metric | Value | Significance |
|--------|-------|-------------|
| p-value | 2.3e-9 | *** |
| Effect size | 0.72 | Large |
| CI 95% | [0.58, 0.86] | - |
| Power | 0.94 | Adequate |

### Experimental Validation Recommended

1. **In vitro**: Enzyme kinetics assay
2. **In vivo**: Animal model validation
3. **Clinical**: Phase I trial feasibility

---
*Generated by Bio Intel 300B • Domain: Biomedical • Confidence: Very High*`;

      case 'multimodal':
        return `## Multi-Modal Analysis

### Integrated Assessment

Combining textual analysis with structural and functional data:

#### Textual Analysis
Your query relates to "${prompt.substring(0, 40)}..." which connects to:
- 147 related publications (2020-2024)
- 23 clinical trials (12 completed, 11 ongoing)
- 4 FDA-approved interventions in similar domain

#### Structural Correlation
- Molecular docking scores correlate with experimental IC50 (R² = 0.78)
- 3D pharmacophore features align with known binders
- ADMET predictions favorable

#### Functional Implications
- Pathway impact: Moderate-high (Z-score = 2.34)
- Network centrality: Top 5% of target interactome
- Disease association: Strong (OR = 3.2)

### Synthesis

The convergence of evidence from multiple modalities supports:
✅ Valid therapeutic target
✅ Drug-like properties achievable
✅ Mechanism of action well-characterized

### Next Steps
1. Lead optimization cycle
2. Preclinical toxicity screening
3. IND-enabling studies

---
*Generated by MultiModal 300B • Modalities: Text+Structure+Function*`;

      default:
        return `## Processing Complete

Your query has been analyzed by the selected AI model.

### Summary
The system has processed your input and generated relevant insights based on the available knowledge base.

### Key Points
- Analysis completed successfully
- Results are ready for review
- Additional details available on request

### Action Items
1. Review generated insights
2. Validate critical findings
3. Document conclusions

---
*Response generated by ${AI_MODELS.find(m => m.id === selectedModel)?.name}*`;
    }
  };

  // Load template
  const handleLoadTemplate = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setPromptText(template.template);
    }
  };

  // Get model badge color
  const getModelBadgeColor = (type: AIModel['type']) => {
    const colors: Record<string, string> = {
      llm: 'bg-blue-500',
      vision: 'bg-purple-500',
      quantum: 'bg-cyan-500',
      scientific: 'bg-green-500',
      multimodal: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('aethel.title') || 'AETHEL AI Platform'}</h1>
        <p className="text-muted-foreground mt-1">
          Advanced Experimental Theoretical Hypercomputing Emulation Layer
        </p>
        
        {/* Connection Status */}
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant={isConnected ? 'default' : 'outline'}
            onClick={handleToggleConnection}
            disabled={isProcessing}
          >
            {isConnected ? '🟢 Connected' : '⚫ Connect to AETHEL'}
          </Button>
          
          {connectionLatency && (
            <span className="text-sm text-muted-foreground">
              Latency: {connectionLatency}ms
            </span>
          )}
          
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            🆓 Free Tier Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Models & Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Model Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select AI Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AI_MODELS.map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    disabled={!model.isAvailable || !isConnected}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedModel === model.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : !model.isAvailable
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs text-white ${getModelBadgeColor(model.type)}`}>
                        {model.type.toUpperCase()}
                      </span>
                      {!model.isAvailable && (
                        <Badge variant="secondary" className="text-xs">Offline</Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm">{model.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{model.specialty}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{model.parameters}</span>
                      <span>•</span>
                      <span>{model.speed}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prompt Templates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PROMPT_TEMPLATES.map(template => (
                  <Button
                    key={template.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadTemplate(template.id)}
                    disabled={!isConnected}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prompt Input */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Enter Your Prompt</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)} disabled={!isConnected}>
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <span className="text-xs text-muted-foreground w-20">
                    Budget: {computeBudget}%
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={computeBudget}
                    onChange={(e) => setComputeBudget(parseInt(e.target.value))}
                    className="w-24"
                    disabled={!isConnected}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={
                  isConnected 
                    ? "Enter your research query or paste your prompt here..."
                    : "Connect to AETHEL AI to start querying..."
                }
                rows={6}
                className="resize-none font-mono text-sm"
                disabled={!isConnected}
              />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {promptText.length} characters • ~{Math.ceil(promptText.length / 4)} tokens
                </span>
                <Button
                  onClick={handleSubmitPrompt}
                  disabled={!promptText.trim() || !isConnected || isProcessing}
                >
                  {isProcessing ? (
                    <>⏳ Processing... {Math.round(processingProgress)}%</>
                  ) : (
                    '🚀 Submit to AETHEL'
                  )}
                </Button>
              </div>

              {isProcessing && (
                <Progress value={processingProgress} className="h-2" />
              )}
            </CardContent>
          </Card>

          {/* Response Display */}
          {(currentResponse || aethelPrompts.some(p => p.response)) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  AI Response
                  <Badge variant="secondary" className="text-xs">
                    {AI_MODELS.find(m => m.id === selectedModel)?.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-lg max-h-[500px] overflow-auto">
                  {currentResponse || (
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {aethelPrompts.find(p => p.response)?.response}
                    </pre>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(currentResponse);
                  }}>
                    📋 Copy Response
                  </Button>
                  <Button size="sm" variant="outline">
                    💾 Save to Workspace
                  </Button>
                  <Button size="sm" variant="outline">
                    🔄 Refine Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Status & History */}
        <div className="space-y-4">
          {/* Connection Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusItem label="Compute Utilization" value={metrics.computeUtilization} unit="%" />
              <StatusItem label="Memory Usage" value={metrics.memoryUsage} unit="%" />
              <StatusItem label="GPU Usage" value={metrics.gpuUsage} unit="%" />
              <StatusItem label="Network I/O" value={metrics.networkIO} unit="%" />
              
              <div className="pt-3 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Jobs</span>
                  <span className="font-medium">{metrics.activeJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Queue Depth</span>
                  <span className="font-medium">{metrics.queueDepth}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt History */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recent Prompts</CardTitle>
                <Button size="sm" variant="ghost" onClick={clearPromptHistory}>
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {aethelPrompts.slice(0, 10).map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setPromptText(entry.prompt.value);
                      setSelectedModel(entry.model.value);
                    }}
                    className={`w-full text-left p-2 rounded text-xs hover:bg-muted transition-colors ${
                      entry.status === 'processing' ? 'animate-pulse bg-blue-50' :
                      entry.status === 'completed' ? '' :
                      ''
                    }`}
                  >
                    <div className="font-medium truncate">{entry.prompt.value.substring(0, 60)}...</div>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <span>{entry.model.value.split(' ')[0]}</span>
                      <span>{entry.timestamp.toLocaleTimeString()}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {entry.status}
                      </Badge>
                    </div>
                  </button>
                ))}
                
                {aethelPrompts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No prompts yet. Submit one above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Session Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Prompts</span>
                <span className="font-medium">{aethelPrompts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens Used</span>
                <span className="font-medium">
                  {aethelPrompts.reduce((acc, p) => acc + p.tokensUsed.value, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Compute Time</span>
                <span className="font-medium">
                  {aethelPrompts.length > 0
                    ? `${(aethelPrompts.reduce((acc, p) => acc + p.computeTime.value, 0) / aethelPrompts.length).toFixed(1)}s`
                    : '-'
                  }
                </span>
              </div>
              
              <div className="pt-3 border-t mt-3">
                <p className="text-xs text-muted-foreground">
                  🆓 Free tier: Unlimited queries during demo period
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function StatusItem({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}{unit}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}
