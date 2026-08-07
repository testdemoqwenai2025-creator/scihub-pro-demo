'use client';

/**
 * SciHub Pro - AETHEL AI Page
 * 
 * AI Research Assistant with:
 * - Multiple model selection (free & pro)
 * - Token tracking and budget management
 * - Conversation history
 * - Context-aware responses
 * - Call-for-action for premium features
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useSciHubStore, createDynamicField } from '@/store/useSciHubStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { AethelSkeleton, ChatBubbleSkeleton } from '@/components/SkeletonComponents';

// ============ SUGGESTED PROMPTS ============

const SUGGESTED_PROMPTS = [
  {
    category: 'Literature Review',
    icon: '📚',
    prompts: [
      'Summarize recent advances in CRISPR gene therapy',
      'What are the key findings in AlphaFold2 papers?',
      'Compare machine learning approaches in drug discovery',
    ],
  },
  {
    category: 'Code Generation',
    icon: '💻',
    prompts: [
      'Write Python code to analyze RNA-seq data',
      'Create an SQL query for differential expression',
      'Generate R code for volcano plot visualization',
    ],
  },
  {
    category: 'Research Methods',
    icon: '🔬',
    prompts: [
      'Explain how GATK variant calling works',
      'What statistical tests should I use for my experiment?',
      'How do I design a clinical trial protocol?',
    ],
  },
  {
    category: 'Data Analysis',
    icon: '📊',
    prompts: [
      'Help me interpret my PCA results',
      'What does p-value < 0.05 really mean?',
      'How should I handle missing data in my dataset?',
    ],
  },
];

// ============ AETHEL AI PAGE COMPONENT ============

export default function AethelPage() {
  const { t } = useTranslation();
  const store = useSciHubStore();
  
  const {
    aethelModels,
    aethelQueries,
    sendAethelQuery,
    clearAethelHistory,
    activeAethelQuery,
    activities,
    addActivity,
    preferences,
    triggerUpgradePrompt,
  } = store;

  // UI State
  const [selectedModelId, setSelectedModelId] = useState(aethelModels[0]?.id || '');
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get selected model
  const selectedModel = aethelModels.find(m => m.id === selectedModelId);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Token usage stats
  const totalTokensUsed = aethelQueries.reduce((sum, q) => sum + q.tokensUsed.value, 0);
  const queriesToday = aethelQueries.filter(q => {
    const queryDate = new Date(q.timestamp);
    const today = new Date();
    return queryDate.toDateString() === today.toDateString();
  }).length;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aethelQueries]);

  // ============ HANDLERS ============

  const handleSendQuery = async () => {
    if (!promptInput.trim() || !selectedModelId) return;

    setIsProcessing(true);
    
    try {
      await sendAethelQuery(selectedModelId, promptInput);
      
      addActivity({
        type: 'query',
        message: createDynamicField(`AETHEL AI query sent (${selectedModel?.name})`),
        icon: '🤖',
      });

      setPromptInput('');

      // Trigger upgrade prompt if using pro features on free tier
      if (selectedModel?.tier === 'pro' && totalTokensUsed > 10000) {
        setTimeout(() => triggerUpgradePrompt('ai_tokens'), 1000);
      }
    } catch (error) {
      console.error('Query failed:', error);
      addActivity({
        type: 'error_recovery',
        message: createDynamicField('AI query failed — please try again'),
        icon: '⚠️',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setPromptInput(prompt);
  };

  const getModelStatusBadge = (model: typeof aethelModels[0]) => {
    if (!model.available) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Offline</Badge>;
    }
    if (model.tier === 'free') {
      return <Badge className="bg-green-100 text-green-700">Free</Badge>;
    }
    return <Badge className="bg-purple-100 text-purple-700">Pro</Badge>;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return String(tokens);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AethelSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          🤖 {t('aethel.title') || 'AETHEL AI Assistant'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Your AI research assistant for literature analysis, code generation, and scientific insights
        </p>

        {/* Usage Stats */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <span>📊 Tokens used today:</span>
            <span className="font-medium">{formatTokens(totalTokensUsed)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>💬 Queries:</span>
            <span className="font-medium">{queriesToday} today, {aethelQueries.length} total</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Model Selector */}
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {aethelModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">({model.parameters})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedModel && (
                  <div className="flex items-center gap-2">
                    {getModelStatusBadge(selectedModel)}
                    <span className="text-sm text-muted-foreground">
                      {selectedModel.specialty}
                    </span>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={clearAethelHistory}
              >
                🗑️ Clear History
              </Button>
            </div>

            {selectedModel && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Model Info</span>
                  <Badge variant={selectedModel.tier === 'free' ? 'secondary' : 'default'}>
                    {selectedModel.tier === 'free' ? 'Free Tier' : 'Pro Tier'}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {selectedModel.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Speed: {selectedModel.speed}</span>
                  <span>Max tokens: {formatTokens(selectedModel.maxTokens)}</span>
                  {selectedModel.inputCost > 0 && (
                    <>
                      <span>${selectedModel.inputCost}/1K input</span>
                      <span>${selectedModel.outputCost}/1K output</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-auto p-4 space-y-4">
            {aethelQueries.length === 0 ? (
              /* Empty State */
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <span className="text-5xl block mb-4">🤖</span>
                  <h3 className="text-xl font-semibold mb-2">Welcome to AETHEL AI</h3>
                  <p className="text-muted-foreground mb-6">
                    I&apos;m your AI research assistant. Ask me about scientific concepts, 
                    get help with code, or discuss your research findings.
                  </p>

                  {/* Quick Start Prompts */}
                  <div className="grid grid-cols-1 sm-grid-cols-2 gap-2 text-left">
                    {[
                      { icon: '📚', text: 'Explain CRISPR gene editing', sub: 'Scientific concepts' },
                      { icon: '💻', text: 'Write Python analysis code', sub: 'Code generation' },
                      { icon: '📊', text: 'Help interpret my results', sub: 'Data analysis' },
                      { icon: '🔬', text: 'Design an experiment', sub: 'Research methods' },
                    ].map((item, i) => (
                      <button
                        key={i}
                        className="p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                        onClick={() => handleSuggestedPrompt(item.text)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{item.icon}</span>
                          <span className="font-medium text-sm">{item.text}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Messages */
              aethelQueries.map((query) => (
                <div key={query.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-3">
                      <p className="text-sm">{query.prompt.value}</p>
                      <p className="text-xs opacity-70 mt-2 text-right">
                        {new Date(query.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  {query.status === 'processing' && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-muted rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          <span className="text-sm text-muted-foreground">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {query.status === 'completed' && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-background border rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span>🤖</span>
                          <span className="font-medium text-sm">{selectedModel?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {query.tokensUsed.value} tokens
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {(query.computeTime.value / 1000).toFixed(1)}s
                          </span>
                        </div>
                        
                        <div className="text-sm whitespace-pre-wrap">
                          {query.response.value}
                        </div>

                        {/* Response Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            📋 Copy
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            🔁 Regenerate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs"
                            onClick={() => handleSuggestedPrompt(`Follow up: ${query.prompt.value.substring(0, 50)}...`)}
                          >
                            💬 Follow Up
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {query.status === 'failed' && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                        <p className="text-sm text-destructive">
                          ❌ Error: {query.error || 'Failed to generate response'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-7 text-xs"
                          onClick={() => sendAethelQuery(selectedModelId, query.prompt.value)}
                        >
                          🔄 Retry
                        </Button>
                      </div>
                    </div>
                  )}

                  {query.status === 'rate_limited' && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-3">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          ⚠️ Rate limit reached. Please wait a moment before sending another message.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 text-xs"
                          onClick={() => triggerUpgradePrompt('ai_tokens')}
                        >
                          ⬆️ Upgrade for More Tokens
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Processing Indicator for Active Query */}
            {activeAethelQuery && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="text-sm text-muted-foreground ml-2">
                      Generating response...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-3">
              <Textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery();
                  }
                }}
                placeholder="Ask me anything about your research..."
                className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                disabled={!selectedModel || isProcessing}
              />
              
              <Button
                onClick={handleSendQuery}
                disabled={!promptInput.trim() || !selectedModel || isProcessing}
                className="self-end"
                size="lg"
              >
                {isProcessing ? '⏳ Sending...' : '🤖 Send'}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tip: Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="w-80 space-y-4 overflow-auto">
          {/* Model Comparison */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Available Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aethelModels.map(model => (
                <button
                  key={model.id}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedModelId === model.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  } ${!model.available ? 'opacity-50' : ''}`}
                  onClick={() => model.available && setSelectedModelId(model.id)}
                  disabled={!model.available}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{model.name}</span>
                    {getModelStatusBadge(model)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {model.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{model.parameters}</span>
                    <span>{model.speed}</span>
                    {model.tier !== 'free' && (
                      <span className="text-orange-600">${model.inputCost}/1K</span>
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Suggested Prompts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Suggested Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {SUGGESTED_PROMPTS.map((category) => (
                <div key={category.category}>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <span>{category.icon}</span>
                    {category.category}
                  </h4>
                  <div className="space-y-1">
                    {category.prompts.map((prompt, i) => (
                      <button
                        key={i}
                        className="w-full text-left p-2 rounded text-xs hover:bg-muted transition-colors truncate"
                        onClick={() => handleSuggestedPrompt(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Token Usage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Usage This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tokens Used</span>
                  <span>{formatTokens(totalTokensUsed)} / 50K</span>
                </div>
                <Progress value={(totalTokensUsed / 50000) * 100} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  <div className="font-bold">{queriesToday}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <div className="font-bold">{aethelQueries.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>

              {totalTokensUsed > 40000 && (
                <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-xs text-yellow-700 dark:text-yellow-300 text-center">
                  ⚠️ Approaching monthly limit. Upgrade for unlimited access.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pro Features CTA */}
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
            <CardContent className="p-4">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                ✨ Unlock Pro Models
              </h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1 mb-3">
                <li>• Access to 70B+ parameter models</li>
                <li>• Higher rate limits</li>
                <li>• Priority processing</li>
                <li>• Advanced analysis modes</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => triggerUpgradePrompt('ai_tokens')}
              >
                View Pro Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
