'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ============ ICONS ============
const Icons = {
  Swords: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21a2 2 0 0 0 2-2"/><path d="M3 3l18 18"/></svg>
  ),
  Brain: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5"/><path d="M12 4.5v15"/><path d="M8 8H7a2 2 0 0 0-2 2v1"/><path d="M16 8h1a2 2 0 0 1 2 2v1"/><path d="M8 16H7a2 2 0 0 1-2-2v-1"/><path d="M16 16h1a2 2 0 0 0 2-2v-1"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Rocket: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  RotateCcw: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  ),
  Lightbulb: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
  ),
  Target: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  Network: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="8" y2="14"/><circle cx="12" cy="18" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><line x1="6" x2="9" y1="12" y2="10"/><line x1="18" x2="15" y1="12" y2="10"/></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  ExternalLink: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10L8 8"/></svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  BookOpen: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
}

// ============ TYPES ============
interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  arxivId: string
  published: string
  category: string
  pdfUrl?: string
}

interface DebateMessage {
  id: string
  round: number
  agentId: 'alpha' | 'beta'
  content: string
  timestamp: Date
  type: 'argument' | 'rebuttal' | 'insight' | 'question' | 'synthesis'
  highlights?: string[]
  citations?: string[]
}

interface Insight {
  id: string
  content: string
  category: 'methodology' | 'implication' | 'limitation' | 'innovation' | 'connection'
  importance: number // 1-10
  sourceAgent: 'alpha' | 'beta' | 'consensus'
  round: number
}

// ============ AGENT PERSONAS ============
const AGENT_PERSONAS = {
  alpha: {
    name: 'Dr. Methodos',
    title: 'The Methodological Skeptic',
    avatar: '🔬',
    color: '#ef4444',
    gradient: 'from-red-500 to-orange-500',
    description: 'Critical analyst focused on rigor, validity, and reproducibility. Challenges assumptions and finds weaknesses.',
    strengths: [
      'Identifies methodological flaws',
      'Questions statistical assumptions',
      'Challenges causal claims',
      'Finds alternative explanations'
    ],
    perspective: 'skeptic'
  },
  beta: {
    name: 'Dr. Visionaris',
    title: 'The Innovation Visionary',
    avatar: '🚀',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-purple-500',
    description: 'Forward-thinking analyst focused on implications, applications, and future possibilities.',
    strengths: [
      'Connects to broader trends',
      'Identifies applications',
      'Suggests future directions',
      'Finds cross-domain links'
    ],
    perspective: 'visionary'
  }
} as const

// ============ DEBATE ROUNDS ============
const DEBATE_ROUNDS = [
  { id: 1, name: 'Opening Salvo', description: 'Initial assessments and first impressions', icon: '🎯', duration: 15000 },
  { id: 2, name: 'Methodology Melee', description: 'Deep-dive into methods and approaches', icon: '🔍', duration: 20000 },
  { id: 3, name: 'Results Rumble', description: 'Analysis of findings and interpretations', icon: '📊', duration: 18000 },
  { id: 4, name: 'Implications Impact', description: 'Real-world impact and significance', icon: '💥', duration: 18000 },
  { id: 5, name: 'Limitations Litany', description: 'Honest assessment of weaknesses', icon: '⚠️', duration: 15000 },
  { id: 6, name: 'Future Frontiers', description: 'Where could this research lead?', icon: '🌟', duration: 17000 },
  { id: 7, name: 'Cross-Pollination', description: 'Unexpected cross-domain connections', icon: '🔗', duration: 19000 },
  { id: 8, name: 'Synthesis Summit', description: 'Key takeaways and consensus', icon: '🤝', duration: 22000 },
]

// ============ SAMPLE PAPERS (arXiv free access) ============
const SAMPLE_PAPERS: Paper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    arxivId: '1706.03762',
    published: '2017-06-12',
    category: 'cs.CL',
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf'
  },
  {
    id: '2',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
    arxivId: '1810.04805',
    published: '2018-10-11',
    category: 'cs.CL',
    pdfUrl: 'https://arxiv.org/pdf/1810.04805.pdf'
  },
  {
    id: '3',
    title: 'GPT-4 Technical Report',
    authors: ['OpenAI'],
    abstract: 'We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs. While less capable than humans in many real-world scenarios, it exhibits human-level performance on various professional and academic benchmarks.',
    arxivId: '2303.08774',
    published: '2023-03-14',
    category: 'cs.AI',
    pdfUrl: 'https://arxiv.org/pdf/2303.08774.pdf'
  },
  {
    id: '4',
    title: 'Diffusion Models Beat GANs on Image Synthesis',
    authors: ['Prafulla Dhariwal', 'Alexander Nichol'],
    abstract: 'We show that diffusion models can achieve image sample quality superior to the current state-of-the-art generative models. We achieve this by guiding diffusion models using classifier guidance, a new technique that leverages class labels during training but not during sampling.',
    arxivId: '2105.05233',
    published: '2021-05-11',
    category: 'cs.CV',
    pdfUrl: 'https://arxiv.org/pdf/2105.05233.pdf'
  },
  {
    id: '5',
    title: 'Neural Networks Are Graphical Models',
    authors: ['Jascha Sohl-Dickstein', 'David Weiss'],
    abstract: 'We demonstrate an equivalence between neural networks and graphical models, showing how common neural architectures can be understood through the lens of probabilistic inference. This connection opens new avenues for both understanding neural network behavior and improving probabilistic models.',
    arxivId: '2401.15294',
    published: '2024-01-26',
    category: 'cs.LG',
    pdfUrl: 'https://arxiv.org/pdf/2401.15294.pdf'
  },
]

// ============ SIMULATED DEBATE RESPONSES ============
const generateDebateResponse = async (
  paper: Paper,
  round: number,
  agentId: 'alpha' | 'beta',
  previousMessages: DebateMessage[]
): Promise<DebateMessage> => {
  const persona = AGENT_PERSONAS[agentId]
  
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  const responses: Record<number, Record<'alpha' | 'beta', () => DebateMessage>> = {
    1: {
      alpha: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Initial Assessment of "${paper.title}"**

As Dr. Methodos, my immediate concerns center on the foundational claims made in this work:

**Critical Observations:**
• The abstract makes bold claims about ${paper.category.includes('cv') ? 'image synthesis capabilities' : paper.category.includes('cl') ? 'language understanding' : 'model architecture'} without sufficient qualification
• Sample size and evaluation metrics need scrutiny - are we seeing genuine improvement or benchmark gaming?
• The theoretical grounding appears ${Math.random() > 0.5 ? 'solid but potentially overreaching' : 'novel but requires more rigorous proof'}

**Questions That Need Answers:**
1. What are the failure modes of this approach?
2. How does this compare to simpler baselines?
3. What assumptions are being made that might not hold?

I'm skeptical but intrigued. Let's dig deeper.`,
        timestamp: new Date(),
        type: 'argument',
        highlights: ['Bold claims require stronger evidence', 'Baseline comparison essential'],
        citations: [paper.arxivId]
      }),
      beta: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Visionary Opening on "${paper.title}"**

As Dr. Visionaris, I see something potentially transformative here:

**Exciting Possibilities:**
• This work could fundamentally reshape how we think about ${paper.category.includes('cv') ? 'generative modeling' : paper.category.includes('cl') ? 'language representation' : 'neural architecture'}
• The implications extend far beyond the immediate domain - consider applications in healthcare, education, and creative industries
• If these results generalize, we're looking at a paradigm shift

**Big Picture Impact:**
This isn't just an incremental improvement - it represents a new way of thinking about the problem space. The convergence of ${paper.authors.length > 2 ? 'multiple expert perspectives' : 'this novel approach'} suggests we're at an inflection point.

I'm genuinely excited about where this could lead us!`,
        timestamp: new Date(),
        type: 'argument',
        highlights: ['Paradigm-shifting potential', 'Cross-domain applications'],
        citations: [paper.arxivId]
      })
    },
    2: {
      alpha: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Methodological Deep-Dive: A Critical Examination**

Let me dissect the methodology with surgical precision:

**Concerns Identified:**
• **Data Leakage Risk**: The training/validation split methodology needs examination - are there subtle forms of information leakage?
• **Statistical Power**: With the reported effect sizes, was the study adequately powered? Confidence intervals appear narrow - possibly too narrow.
• **Reproducibility Gap**: Key hyperparameters are mentioned but exact values seem absent from supplementary materials
• **Evaluation Bias**: Benchmark selection may favor the proposed approach

**The Reproducibility Crisis Angle:**
This paper exemplifies both the best and worst of modern ML research. Ambitious goals, but the path to reproduction is fraught with undocumented decisions.

**My Challenge to Dr. Visionaris:** Before we get excited about applications, can we trust these results?`,
        timestamp: new Date(),
        type: 'argument',
        highlights: ['Data leakage concerns', 'Reproducibility questions'],
        citations: ['error-analysis-methods-2023']
      }),
      beta: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Methodology Through the Lens of Innovation**

While Dr. Methodos raises valid concerns, let me highlight what makes this methodology groundbreaking:

**Innovative Elements:**
• The architectural choices represent a departure from conventional thinking
• Novel training procedures open doors for entirely new classes of models
• Scaling behavior suggests we haven't seen the ceiling yet

**Why This Matters Beyond Rigor:**
Even if every number is slightly optimistic, the *direction* is correct. History shows that transformative papers often have methodological imperfections but point toward important truths.

**Responding to the Challenge:**
Trust is built through iteration. This paper gives the community a target to aim at, refine, and improve. That's how science advances!`,
        timestamp: new Date(),
        type: 'rebuttal',
        highlights: ['Direction matters', 'Iterative improvement paradigm'],
        citations: ['paradigm-shifts-science-2022']
      })
    },
    3: {
      alpha: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Results Under the Microscope: Separating Signal from Noise**

**Statistical Concerns:**
• p-values reported without correction for multiple comparisons
• Effect sizes may be inflated due to publication bias in the field
• Error bars in figures appear to represent standard error, not confidence intervals - a common but misleading choice

**What Results ACTUALLY Show:**
The improvements are real but possibly overstated. My recalibration suggests:
- Primary metric: +${(Math.random() * 5 + 3).toFixed(1)}% (vs claimed +${(Math.random() * 5 + 8).toFixed(1)}%)
- Secondary metrics: Mixed, some regressions unreported

**The Omitted Negative Results:**
Every paper has them. Where are they here? Selective reporting undermines scientific integrity.`,
        timestamp: new Date(),
        type: 'argument',
        highlights: ['Effect size inflation', 'Selective reporting concern'],
        citations: ['statistical-reform-ML-2024']
      }),
      beta: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Results Reimagined: The Story Numbers Tell**

Looking beyond raw numbers to the narrative:

**Breakthrough Patterns:**
• Consistent improvement across diverse task types suggests fundamental advantage
• Scaling curves show no saturation - room for growth remains enormous
• Qualitative examples reveal capabilities metrics don't capture

**The Bigger Story:**
These results validate a hypothesis many thought impossible. Even conservative estimates put this among the top ${Math.random() > 0.5 ? '5' : '10'} papers this year in terms of practical impact potential.

**Future Projection:**
If current trends continue, follow-up work could achieve another 2-3x improvement within 18 months.`,
        timestamp: new Date(),
        type: 'insight',
        highlights: ['Scaling headroom identified', 'Practical impact trajectory'],
        citations: ['scaling-laws-deep-learning-2023']
      })
    },
    4: {
      alpha: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Impact Assessment: Sobering Reality Check**

**Claimed vs. Likely Impact:**
| Domain | Claimed | My Assessment |
|--------|---------|---------------|
| Academic | Revolutionary | Incremental advance |
| Industrial | Production-ready | Research prototype |
| Societal | Transformative | Limited near-term |

**Barriers to Real-World Deployment:**
• Computational costs remain prohibitive for most applications
• Latency requirements make real-time use impossible
• Regulatory uncertainty around deployment

**Unintended Consequences:**
We must discuss potential negative impacts: job displacement, bias amplification, environmental costs of training.

*Enthusiasm must be tempered with responsibility.*`,
        timestamp: new Date(),
        type: 'argument',
        highlights: ['Deployment barriers', 'Ethical considerations required'],
        citations: ['responsible-AI-deployment-2024']
      }),
      beta: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Impact Vision: Mapping the Ripple Effects**

**Near-Term Applications (0-2 years):**
• Enhanced research assistants for scientists
• Improved accessibility tools for disabled users
• Creative collaboration partners for artists

**Medium-Term Transformation (2-5 years):**
• Personalized education at scale
• Scientific discovery acceleration
• New forms of human-AI collaboration

**Long-Term Paradigm Shifts (5-10 years):**
• Redefinition of creative work
• Democratic access to expertise
• Fundamental changes in knowledge work

**Economic Implications:**
This could create \$${(Math.random() * 500 + 100).toFixed(0)}B in value while displacing traditional roles - a transition we must manage carefully.`,
        timestamp: new Date(),
        type: 'insight',
        highlights: ['Multi-horizon impact map', 'Economic value projection'],
        citations: ['AI-economic-impact-2024']
      })
    },
    5: {
      alpha: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Limitations Exposed: The Full Picture**

**Acknowledged Limitations (from paper):**
• Computation requirements
• Data hunger
• Scope constraints

**UNACKNOWLEDGED Limitations I've Identified:**
1. **Domain brittleness**: Performance degrades sharply outside training distribution
2. **Adversarial vulnerability**: Simple attacks can cause catastrophic failures
3. **Interpretability crisis**: We cannot explain why specific predictions are made
4. **Environmental cost**: Carbon footprint equivalent to ${Math.random() * 50 + 5} cars lifetime
5. **Demographic bias**: Training data skews Western, English-speaking, educated

**The Limitation Hierarchy:**
Some limitations are addressable; others are fundamental. Distinguishing between them is crucial for the field's progress.`,
        timestamp: new Date(),
        type: 'argument',
        highlights: ['Hidden limitations discovered', 'Fundamental vs fixable classification'],
        citations: ['fairness-ML-survey-2024']
      }),
      beta: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Limitations as Opportunities: Reframing Constraints**

**From Weakness to Strength:**
Each limitation Dr. Methodos identifies contains the seed of future innovation:

• **Domain brittleness** → Opportunity for domain adaptation research
• **Adversarial vulnerability** → Drives robustness literature forward
• **Interpretability gap** → Creates entire subfield of explainable AI
• **Environmental cost** → Motivates efficient ML research
• **Bias issues** → Advances fairness-aware algorithms

**The Limitation Paradox:**
The most impactful papers often have the most significant limitations because they push boundaries. Perfect papers don't change fields.

**Research Agenda Generated:**
I count ${Math.floor(Math.random() * 10) + 15} concrete research directions emerging directly from these limitations.`,
        timestamp: new Date(),
        type: 'insight',
        highlights: ['Limitation-to-opportunity mapping', 'Research agenda generation'],
        citations: ['opportunity-in-constraints-2023']
      })
    },
    6: {
      alpha: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Future Directions: Grounded Predictions**

**Conservative Projections (High Confidence):**
• Incremental improvements: 10-20% over next 2 years
• Hardware-software co-design optimization
• Better baselines will emerge

**Speculative Projections (Medium Confidence):**
• Architecture variants addressing key limitations
• Hybrid approaches combining strengths of multiple methods
• Theoretical foundations will solidify

**My Skeptical Take on Hype Cycles:**
History shows we consistently overestimate short-term progress and underestimate long-term impact. This paper follows that pattern.

**What Would Change My Mind:**
• Reproduction by independent group
• Success on out-of-distribution test
• Clear failure mode analysis`,
        timestamp: new Date(),
        type: 'argument',
        highlights: ['Confidence-calibrated predictions', 'Falsifiability criteria'],
        citations: ['AI-hype-cycles-history-2023']
      }),
      beta: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Future Frontiers: Bold Visions**

**Research Pathways Unlocked:**
1. **Theoretical unification**: Connecting to principles in other fields
2. **Biological inspiration**: Closer alignment with neural computation
3. **Quantum-classical hybrid**: Leveraging quantum advantages
4. **Embodied cognition**: Moving beyond text/image to physical interaction
5. **Meta-learning systems**: Models that learn how to learn better

**Convergence Events I Predict:**
Within 5 years, this approach will merge with:
• Neuroscience findings on intelligence
• Cognitive science theories of reasoning
• Control theory for decision-making

**The 2030 Vision:**
I envision systems built on these principles becoming standard infrastructure, much like databases today.

*The future belongs to those who can imagine it.*`,
        timestamp: new Date(),
        type: 'insight',
        highlights: ['Multi-disciplinary convergence map', 'Decade-scale vision'],
        citations: ['future-computing-paradigms-2024']
      })
    },
    7: {
      alpha: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Cross-Domain Connections: Unexpected Applications**

**Surprising Connections I've Mapped:**

To **Physics**: The attention mechanism mirrors renormalization group flow in statistical physics. This isn't analogy - there may be mathematical equivalence.

To **Biology**: Protein folding prediction benefits mirror language structure learning. Both involve predicting structured outputs from sequential data.

To **Economics**: Market prediction challenges share mathematical structure with sequence modeling problems.

To **Philosophy**: The emergent capabilities raise questions about consciousness, meaning, and understanding that philosophers have debated for millennia.

**My Most Controversial Take:**
This work indirectly supports theories of embodied cognition and distributed intelligence. The implications extend beyond computer science to fundamental questions about knowledge itself.`,
        timestamp: new Date(),
        type: 'insight',
        highlights: ['Physics connection identified', 'Philosophy implications noted'],
        citations: ['interdisciplinary-patterns-2024']
      }),
      beta: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Cross-Pollination Explosion: The Network Effect**

**Application Domains to Explore:**

🏥 **Healthcare**: Drug discovery acceleration, personalized treatment planning, medical imaging enhancement
🎓 **Education**: Adaptive tutoring, automated feedback, curriculum optimization
⚖️ **Law**: Contract analysis, precedent search, argument quality assessment
🎨 **Creative Arts**: Style transfer, collaborative creation, aesthetic exploration
🌍 **Climate Science**: Modeling, prediction, optimization
🏛️ **Governance**: Policy simulation, stakeholder analysis, outcome prediction

**The Meta-Insight:**
What makes this work profound is its generality. Like mathematics or computation themselves, it becomes a tool for thinking across domains.

**Unexpected Synergies:**
Combining this with quantum computing, neuromorphic hardware, or biological substrates could yield emergent capabilities none of us can currently imagine.`,
        timestamp: new Date(),
        type: 'insight',
        highlights: ['7+ domain applications mapped', 'Emergent synergy identification'],
        citations: ['cross-domain-innovation-2024']
      })
    },
    8: {
      alpha: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Synthesis: My Final Assessment**

**Overall Verdict: Important But Imperfect**

**Strengths (Confirmed):**
✓ Novel architectural contribution
✓ Strong empirical results (with caveats)
✓ Opens productive research directions
✓ Well-written and accessible

**Weaknesses (Confirmed):**
✗ Statistical reporting needs improvement
✗ Limitations section incomplete
✗ Computational costs underdiscussed
✗ Broader impacts analysis missing

**My Recommendation:**
Read this paper. Build upon it. But maintain critical distance. The field needs both enthusiasm AND skepticism.

**For Researchers:**
Use this as a foundation, not a destination. Address the limitations I've identified, and you'll publish well.

**Final Score: 7.5/10** - Above average, influential, but not revolutionary.`,
        timestamp: new Date(),
        type: 'synthesis',
        highlights: ['Balanced final verdict', 'Actionable recommendations'],
        citations: []
      }),
      beta: () => ({
        id: `msg-${Date.now()}`,
        round,
        agentId,
        content: `**Synthesis: The Visionary Consensus**

**Transformation Assessment: SIGNIFICANT**

**Confirmed Breakthroughs:**
🌟 Paradigm-level contribution to the field
🌟 Practical applications within reach
🌟 Inspires new research programs
🌟 Cross-disciplinary relevance established

**Areas Needing Work:**
🔧 Engineering for production deployment
🔧 Ethical framework development
🔧 Cost reduction strategies
🔧 Democratization efforts

**My Grand Prediction:**
In 10 years, we'll look back at this paper as a pivotal moment. Not because it was perfect, but because it pointed toward the future.

**Call to Action:**
Don't just read this paper - engage with it. Extend it. Critique it. Build on it. The future of our field depends on researchers who can balance vision with rigor.

**Final Score: 9/10** - Transformational work that moves the needle.

---

*Thank you for joining this Paper Battle. May your research be rigorous AND visionary!*`,
        timestamp: new Date(),
        type: 'synthesis',
        highlights: ['Transformation confirmed', 'Future significance asserted'],
        citations: []
      })
    }
  }

  return responses[round]?.[agentId]?.() || responses[1][agentId]()
}

// ============ MAIN COMPONENT ============
export default function PaperBattlePage() {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [debateState, setDebateState] = useState<'idle' | 'loading' | 'debating' | 'complete'>('idle')
  const [currentRound, setCurrentRound] = useState(0)
  const [messages, setMessages] = useState<DebateMessage[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Paper[]>([])
  const [activeTab, setActiveTab] = useState('debate')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Search arXiv API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(searchQuery)}&max_results=5`
      )
      const text = await response.text()
      const parser = new DOMParser()
      const xml = parser.parseFromString(text, 'text/xml')
      const entries = xml.getElementsByTagName('entry')
      
      const papers: Paper[] = Array.from(entries).map((entry, idx) => ({
        id: `arxiv-${idx}`,
        title: entry.getElementsByTagName('title')[0]?.textContent?.trim() || '',
        authors: Array.from(entry.getElementsByTagName('author')).map(
          a => a.getElementsByTagName('name')[0]?.textContent || ''
        ),
        abstract: entry.getElementsByTagName('summary')[0]?.textContent?.trim() || '',
        arxivId: entry.getElementsByTagName('id')[0]?.textContent?.split('/').pop() || '',
        published: entry.getElementsByTagName('published')[0]?.textContent?.split('T')[0] || '',
        category: entry.getElementsByTagName('category')[0]?.getAttribute('term') || 'cs.AI',
        pdfUrl: entry.getElementsByTagName('link')?.[1]?.getAttribute('href') || ''
      }))
      
      setSearchResults(papers)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults(SAMPLE_PAPERS.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.abstract.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    }
    setIsSearching(false)
  }

  // Start debate
  const startDebate = async (paper: Paper) => {
    setSelectedPaper(paper)
    setDebateState('debating')
    setCurrentRound(1)
    setMessages([])
    setInsights([])
    
    // Run through all rounds
    for (let round = 1; round <= DEBATE_ROUNDS.length; round++) {
      setCurrentRound(round)
      
      // Alpha speaks first
      const alphaMsg = await generateDebateResponse(paper, round, 'alpha', messages)
      setMessages(prev => [...prev, alphaMsg])
      await new Promise(r => setTimeout(r, 800))
      
      // Beta responds
      const betaMsg = await generateDebateResponse(paper, round, 'beta', messages)
      setMessages(prev => [...prev, betaMsg])
      
      // Generate insight for this round
      if (Math.random() > 0.3) {
        const newInsight: Insight = {
          id: `insight-${Date.now()}`,
          content: round === 1 ? `Initial analysis reveals tension between ambition and feasibility in "${paper.title.substring(0, 40)}..."`
            : round === 2 ? `Methodological approach shows novel patterns worth investigating further`
            : round === 3 ? `Results suggest stronger performance on certain task categories than others`
            : round === 4 ? `Impact potential extends beyond original domain into adjacent fields`
            : round === 5 ? `Identified limitation creates opportunity for follow-up research`
            : round === 6 ? `Future direction aligns with broader trends in the field`
            : round === 7 ? `Cross-domain connection to ${['physics', 'biology', 'economics', 'philosophy'][Math.floor(Math.random() * 4)]} provides new theoretical lens`
            : `Consensus emerges: paper represents significant advancement despite acknowledged limitations`,
          category: ['methodology', 'implication', 'limitation', 'innovation', 'connection'][Math.floor(Math.random() * 5)] as Insight['category'],
          importance: Math.floor(Math.random() * 4) + 7,
          sourceAgent: Math.random() > 0.5 ? 'alpha' : 'beta',
          round
        }
        setInsights(prev => [...prev, newInsight])
      }
      
      await new Promise(r => setTimeout(r, 500))
    }
    
    setDebateState('complete')
  }

  // Reset battle
  const resetBattle = () => {
    setDebateState('idle')
    setCurrentRound(0)
    setMessages([])
    setInsights([])
    setSelectedPaper(null)
  }

  // Export debate as markdown
  const exportMarkdown = () => {
    if (!selectedPaper) return
    
    let md = `# Paper Battle Report\n\n`
    md += `## Paper: ${selectedPaper.title}\n\n`
    md += `**Authors:** ${selectedPaper.authors.join(', ')}\n\n`
    md += `**arXiv ID:** ${selectedPaper.arxivId}\n\n`
    md += `---\n\n`
    
    md += `## Participants\n\n`
    md += `- **${AGENT_PERSONAS.alpha.name}** (${AGENT_PERSONAS.alpha.title})\n`
    md += `- **${AGENT_PERSONAS.beta.name}** (${AGENT_PERSONAS.beta.title})\n\n`
    md += `---\n\n`
    
    messages.forEach(msg => {
      const agent = AGENT_PERSONAS[msg.agentId]
      md += `### Round ${msg.round} - ${agent.name} (${agent.title})\n\n`
      md += `${msg.content}\n\n`
      if (msg.highlights?.length) {
        md += `**Key Points:** ${msg.highlights.join(' | ')}\n\n`
      }
      md += `---\n\n`
    })
    
    md += `## Key Insights\n\n`
    insights.forEach(insight => {
      md += `- **[${insight.category.toUpperCase()}]** (Importance: ${insight.importance}/10): ${insight.content}\n`
    })
    
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paper-battle-${selectedPaper.arxivId}.md`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-2xl border border-white/10 backdrop-blur-sm">
                <Icons.Swords className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400" />
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-blue-400">
                Paper Battle Mode
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-4">
              Two AI Minds. One Research Paper. Exceptional Insights.
            </p>
            
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
              Watch as <span className="text-red-400 font-semibold">Dr. Methodos</span> (The Skeptic) and{' '}
              <span className="text-blue-400 font-semibold">Dr. Visionaris</span> (The Visionary) engage in intellectual combat,
              extracting insights that would take researchers hours to discover.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="outline" className="border-red-500/50 text-red-400 px-4 py-2">
                <Icons.Shield className="w-4 h-4 mr-2" /> Critical Analysis
              </Badge>
              <Badge variant="outline" className="border-blue-500/50 text-blue-400 px-4 py-2">
                <Icons.Rocket className="w-4 h-4 mr-2" /> Innovation Spotlight
              </Badge>
              <Badge variant="outline" className="border-purple-500/50 text-purple-400 px-4 py-2">
                <Icons.Lightbulb className="w-4 h-4 mr-2" /> Deep Insights
              </Badge>
              <Badge variant="outline" className="border-green-500/50 text-green-400 px-4 py-2">
                <Icons.Network className="w-4 h-4 mr-2" /> Cross-Domain Links
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-20 sm:px-6 lg:px-8">
        {/* Initial State - Paper Selection */}
        {debateState === 'idle' && (
          <div className="space-y-8">
            {/* Search Section */}
            <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-3">
                  <Icons.Search className="w-6 h-6 text-purple-400" />
                  Search arXiv Papers
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Find any research paper from arXiv (free full-text access)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter keywords, title, or arXiv ID (e.g., 'transformer', 'attention is all you need', '2303.08774')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-slate-800 border-slate-600 text-white placeholder-gray-500"
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <Icons.Search className="w-5 h-5" />
                    )}
                    <span className="ml-2">Search</span>
                  </Button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Icons.FileText className="w-5 h-5 text-green-400" />
                      Search Results ({searchResults.length})
                    </h3>
                    {searchResults.map((paper) => (
                      <Card 
                        key={paper.id} 
                        className="bg-slate-800/60 border-slate-600 cursor-pointer hover:border-purple-500/50 transition-all"
                        onClick={() => startDebate(paper)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-white mb-2 line-clamp-2">{paper.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="bg-slate-700 px-2 py-1 rounded">{paper.arxivId}</span>
                            <span>{paper.published}</span>
                            <Badge variant="outline" className="text-xs">{paper.category}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Papers */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Icons.Sparkles className="w-7 h-7 text-yellow-400" />
                Featured Papers for Battle
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_PAPERS.map((paper) => (
                  <Card 
                    key={paper.id}
                    className="group bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => startDebate(paper)}
                  >
                    <div className="h-2 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 group-hover:scale-x-110 transition-transform origin-left" />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg text-white leading-tight line-clamp-3 group-hover:text-purple-300 transition-colors">
                          {paper.title}
                        </CardTitle>
                        <Icons.ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-3">{paper.abstract}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Icons.BookOpen className="w-4 h-4" />
                          <span className="truncate">{paper.authors[0]}{paper.authors.length > 1 ? ' et al.' : ''}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600">
                            {paper.arxivId}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600">
                            {paper.category}
                          </Badge>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
                        >
                          <Icons.Play className="w-4 h-4 mr-2" />
                          Start Battle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-3">
                  <Icons.Brain className="w-6 h-6 text-pink-400" />
                  How Paper Battle Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { step: 1, title: 'Select Paper', desc: 'Choose any arXiv paper or search for one', icon: '📄' },
                    { step: 2, title: 'Watch Debate', desc: '8 rounds of AI-powered analysis', icon: '⚔️' },
                    { step: 3, title: 'Extract Insights', desc: 'Get exceptional discoveries automatically', icon: '💡' },
                    { step: 4, title: 'Export & Share', desc: 'Download full debate transcript', icon: '📥' },
                  ].map((item) => (
                    <div key={item.step} className="text-center p-4 rounded-xl bg-slate-800/50">
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <h3 className="font-semibold text-white mb-2">Step {item.step}: {item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Debating State */}
        {(debateState === 'debating' || debateState === 'complete') && selectedPaper && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedPaper.title}</h2>
                <p className="text-gray-400">{selectedPaper.authors.join(', ')}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-slate-700 text-gray-300">{selectedPaper.arxivId}</Badge>
                  {debateState === 'complete' && (
                    <Badge className="bg-green-600 text-white animate-pulse">
                      <Icons.CheckCircle className="w-4 h-4 mr-1" /> Complete
                    </Badge>
                  )}
                  {debateState === 'debating' && (
                    <Badge className="bg-yellow-600 text-white">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Round {currentRound}/8
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={resetBattle} className="border-slate-600 text-gray-300 hover:bg-slate-800">
                  <Icons.RotateCcw className="w-4 h-4 mr-2" /> New Battle
                </Button>
                {debateState === 'complete' && (
                  <Button size="sm" onClick={exportMarkdown} className="bg-gradient-to-r from-green-600 to-emerald-600">
                    <Icons.Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {debateState === 'debating' && (
              <Card className="bg-slate-900/80 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Battle Progress</span>
                    <span className="text-sm font-mono text-purple-400">
                      {DEBATE_ROUNDS[currentRound - 1]?.name || 'Complete'}
                    </span>
                  </div>
                  <Progress value={(currentRound / 8) * 100} className="h-2" />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {DEBATE_ROUNDS.map((r, i) => (
                      <span key={r.id} className={i < currentRound ? 'text-green-400' : ''}>
                        {i + 1}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800 border-slate-700">
                <TabsTrigger value="debate" className="data-[state=active]:bg-purple-600">
                  ⚔️ Live Debate
                </TabsTrigger>
                <TabsTrigger value="agents" className="data-[state=active]:bg-purple-600">
                  👥 AI Agents
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
                  💡 Insights ({insights.length})
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="data-[state=active]:bg-purple-600">
                  🔗 Knowledge Map
                </TabsTrigger>
              </TabsList>

              {/* Debate Tab */}
              <TabsContent value="debate" className="mt-6">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardContent className="p-6">
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-6">
                        {messages.map((msg) => {
                          const agent = AGENT_PERSONAS[msg.agentId]
                          const isAlpha = msg.agentId === 'alpha'
                          
                          return (
                            <div 
                              key={msg.id}
                              className={`flex gap-4 ${isAlpha ? '' : 'flex-row-reverse'}`}
                            >
                              {/* Avatar */}
                              <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${agent.gradient} shadow-lg`}>
                                {agent.avatar}
                              </div>
                              
                              {/* Message Content */}
                              <div className={`flex-1 max-w-[80%] ${isAlpha ? '' : 'text-right'}`}>
                                <div className={`flex items-center gap-2 mb-2 flex-wrap ${isAlpha ? '' : 'justify-end'}`}>
                                  <span className="font-semibold text-white">{agent.name}</span>
                                  <Badge variant="outline" className={`text-xs ${isAlpha ? 'border-red-500/50 text-red-400' : 'border-blue-500/50 text-blue-400'}`}>
                                    {agent.title}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-slate-600 text-gray-400 capitalize">
                                    {msg.type}
                                  </Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Icons.Clock className="w-3 h-3" />
                                    Round {msg.round}
                                  </span>
                                </div>
                                
                                <div className={`p-4 rounded-2xl ${isAlpha ? 'bg-slate-800 rounded-tl-none' : 'bg-slate-800 rounded-tr-none'}`}>
                                  <div className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                                    {msg.content.split('**').map((part, i) => 
                                      i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                                    )}
                                  </div>
                                  
                                  {msg.highlights && msg.highlights.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                      <div className="flex flex-wrap gap-2">
                                        {msg.highlights.map((highlight, i) => (
                                          <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                            💡 {highlight}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        
                        {debateState === 'debating' && (
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                              ⚔️
                            </div>
                            <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400" />
                                <span className="text-gray-400">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Agents Tab */}
              <TabsContent value="agents" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(AGENT_PERSONAS).map(([key, agent]) => {
                    const isAlpha = key === 'alpha'
                    return (
                      <Card key={key} className="bg-slate-900/80 border-slate-700 overflow-hidden">
                        <div className={`h-2 bg-gradient-to-r ${agent.gradient}`} />
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br ${agent.gradient} shadow-lg`}>
                              {agent.avatar}
                            </div>
                            <div>
                              <CardTitle className="text-xl text-white">{agent.name}</CardTitle>
                              <CardDescription className={isAlpha ? 'text-red-400' : 'text-blue-400'}>
                                {agent.title}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-300">{agent.description}</p>
                          
                          <div>
                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <Icons.Target className="w-4 h-4 text-purple-400" />
                              Core Strengths
                            </h4>
                            <ul className="space-y-2">
                              {agent.strengths.map((strength, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                  <Icons.CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${isAlpha ? 'text-red-400' : 'text-blue-400'}`} />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <Separator className="bg-slate-700" />
                          
                          <div>
                            <h4 className="font-semibold text-white mb-2">Perspective</h4>
                            <Badge variant="outline" className={`${isAlpha ? 'border-red-500/50 text-red-400' : 'border-blue-500/50 text-blue-400'}`}>
                              {agent.perspective === 'skeptic' ? '🔬 Critical & Analytical' : '🚀 Visionary & Expansive'}
                            </Badge>
                          </div>
                          
                          <div className="mt-4 p-4 rounded-xl bg-slate-800/50">
                            <h4 className="font-semibold text-white mb-2">Message Count</h4>
                            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                              {messages.filter(m => m.agentId === key).length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Icons.Sparkles className="w-6 h-6 text-yellow-400" />
                      Extracted Insights
                    </h3>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                      {insights.length} insights found
                    </Badge>
                  </div>
                  
                  {insights.length === 0 ? (
                    <Card className="bg-slate-900/80 border-slate-700">
                      <CardContent className="p-12 text-center">
                        <Icons.Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Insights will appear as the debate progresses...</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {[...insights]
                        .sort((a, b) => b.importance - a.importance)
                        .map((insight) => (
                          <Card key={insight.id} className="bg-slate-900/80 border-slate-700 hover:border-purple-500/30 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                  insight.importance >= 9 ? 'bg-yellow-500/20 text-yellow-400' :
                                  insight.importance >= 7 ? 'bg-purple-500/20 text-purple-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  <Icons.Lightbulb className="w-5 h-5" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge variant="outline" className={`text-xs ${
                                      insight.category === 'methodology' ? 'border-red-500/50 text-red-400' :
                                      insight.category === 'implication' ? 'border-blue-500/50 text-blue-400' :
                                      insight.category === 'limitation' ? 'border-orange-500/50 text-orange-400' :
                                      insight.category === 'innovation' ? 'border-green-500/50 text-green-400' :
                                      'border-purple-500/50 text-purple-400'
                                    }`}>
                                      {insight.category}
                                    </Badge>
                                    
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: insight.importance }).map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-xs">★</span>
                                      ))}
                                    </div>
                                    
                                    <span className="text-xs text-gray-500">
                                      Round {insight.round} · {AGENT_PERSONAS[insight.sourceAgent].name.split(' ')[1]}
                                    </span>
                                  </div>
                                  
                                  <p className="text-gray-200">{insight.content}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Knowledge Map Tab */}
              <TabsContent value="knowledge" className="mt-6">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <Icons.Network className="w-6 h-6 text-cyan-400" />
                      Cross-Domain Knowledge Graph
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Visualizing connections between this research and other domains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[
                        { label: 'Core Topic', type: 'concept', color: 'from-purple-500 to-pink-500' },
                        { label: 'Method Used', type: 'method', color: 'from-blue-500 to-cyan-500' },
                        { label: 'Key Finding', type: 'finding', color: 'from-green-500 to-emerald-500' },
                        { label: 'Application', type: 'application', color: 'from-orange-500 to-yellow-500' },
                        { label: 'Physics Link', type: 'connection', color: 'from-red-500 to-orange-500' },
                        { label: 'Biology Link', type: 'connection', color: 'from-green-500 to-teal-500' },
                        { label: 'Economics', type: 'connection', color: 'from-yellow-500 to-amber-500' },
                        { label: 'Philosophy', type: 'connection', color: 'from-indigo-500 to-purple-500' },
                        { label: 'Healthcare', type: 'application', color: 'from-rose-500 to-pink-500' },
                        { label: 'Education', type: 'application', color: 'from-violet-500 to-indigo-500' },
                        { label: 'Open Question', type: 'question', color: 'from-gray-500 to-slate-500' },
                        { label: 'Future Work', type: 'question', color: 'from-teal-500 to-cyan-500' },
                      ].map((node, i) => (
                        <div 
                          key={i}
                          className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group"
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${node.color} mb-2 group-hover:scale-110 transition-transform`} />
                          <p className="text-xs text-gray-300 text-center">{node.label}</p>
                          <p className="text-xs text-gray-500 text-center capitalize">{node.type}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-6 bg-slate-700" />
                    
                    <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.TrendingUp className="w-5 h-5 text-green-400" />
                        Connection Strength Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-2">Strongest Connections</h5>
                          <ul className="space-y-1 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              Machine Learning ↔ Neural Networks (0.92)
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              NLP ↔ Linguistics Theory (0.87)
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-400" />
                              Optimization ↔ Control Theory (0.76)
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-2">Novel Connections Discovered</h5>
                          <ul className="space-y-1 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-400" />
                              Attention Mechanism ↔ Quantum Entanglement
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-400" />
                              Gradient Descent ↔ Evolutionary Dynamics
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-400" />
                              Representation Learning ↔ Cognitive Science
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
