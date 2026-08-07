/**
 * SciHub Pro - Master Store Architecture
 * 
 * CENTRAL DOGMA: "Never Let The Scientist Hit A Wall"
 * 
 * This store implements the complete 5-layer data flow:
 * L1: React Components (Controlled forms with synthetic seed)
 * L2: State Management (Zustand with dirty tracking)
 * L3: Service Layer (API calls with graceful degradation)
 * L4: Persistence (localStorage + IndexedDB with volume thresholds)
 * L5: Data Lake Export (Parquet/CSV with upgrade prompts)
 * 
 * RETENTION FEATURES:
 * - Progressive discovery (always show next step)
 * - Synthetic pre-seeding (zero friction onboarding)
 * - Graceful degradation (API fails → synthetic fallback)
 * - Smart suggestions (context-aware guidance)
 * - Call-for-action prompts (volume limits, feature gates)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDynamicField, updateDynamicField } from './useDynamicStore';

// Helper function for generating unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// ============================================================================
// COMPREHENSIVE TYPE SYSTEM
// ============================================================================

export interface DynamicField<T = any> {
  value: T;
  syntheticValue: T;       // Original pre-filled data (clears on edit)
  isDirty: boolean;        // Has user modified?
  lastModified?: Date;
  isValid: boolean;
  validationError?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  resultsPerPage: number;
  sidebarCollapsed: boolean;
  autoSaveInterval: number; // seconds
  defaultDataSource: string;
  notifications: NotificationPrefs;
  onboardingCompleted: boolean;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
}

export interface NotificationPrefs {
  emailJobComplete: boolean;
  emailNewCollaborator: boolean;
  pushUpdates: boolean;
  weeklyDigest: boolean;
  researchAlerts: boolean;
}

export interface UserProfile {
  displayName: DynamicField<string>;
  email: DynamicField<string>;
  institution: DynamicField<string>;
  orcid: DynamicField<string>;
  bio: DynamicField<string>;
  role: 'researcher' | 'student' | 'developer' | 'professor' | 'community';
  joinDate: Date;
  avatarUrl?: string;
  researchInterests: string[];
  publicationsCount: number;
  hIndex?: number;
}

export interface DashboardStats {
  activeJobs: DynamicField<number>;
  storageUsed: DynamicField<string>;
  storageUsedBytes: DynamicField<number>;
  apiCallsToday: DynamicField<number>;
  collaborators: DynamicField<number>;
  savedItems: DynamicField<number>;
  queriesRun: DynamicField<number>;
  systemHealth: DynamicField<number>;
  streakDays: DynamicField<number>;
}

export interface ActivityEntry {
  id: string;
  type: 'search' | 'save' | 'export' | 'job' | 'collaboration' | 'login' | 
        'download' | 'upload' | 'query' | 'compute' | 'connect' | 'disconnect' |
        'upgrade_prompt' | 'milestone' | 'error_recovery' | 'guidance_shown';
  message: DynamicField<string>;
  icon: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
}

// Dataset types
export interface DatasetItem {
  id: string;
  name: DynamicField<string>;
  description: DynamicField<string>;
  size: DynamicField<string>;
  sizeBytes: DynamicField<number>;
  rows: DynamicField<number>;
  columns: DynamicField<number>;
  type: DynamicField<string>;
  format: DynamicField<string>;
  sourceUrl: DynamicField<string>;
  tags: DynamicField<string[]>;
  lastModified: DynamicField<Date>;
  isPublic: DynamicField<boolean>;
  isFavorite: DynamicField<boolean>;
  downloaded: DynamicField<boolean>;
  downloadProgress: DynamicField<number>;
  createdAt: Date;
  // Storage layer info
  storageLayer: 'local' | 'indexeddb' | 'duckdb' | 'cloud';
  volumeTier: 1 | 2 | 3 | 4;
}

// Connector types
export interface ConnectorConfig {
  id: string;
  name: string;
  category: 'biological' | 'chemical' | 'literature' | 'repositories' | 'compute';
  isEnabled: DynamicField<boolean>;
  isConnected: DynamicField<boolean>;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  recordCount: DynamicField<number>;
  apiEndpoint: DynamicField<string>;
  apiKey: DynamicField<string>;
  freeTierLimit: number; // requests per second
  isFreeTier: boolean;
  features: string[];
  lastSync?: Date;
  latency?: number; // ms
  dataTypes: string[];
}

// Compute Job types
export interface ComputeJob {
  id: string;
  name: DynamicField<string>;
  type: 'variant_calling' | 'protein_folding' | 'drug_screening' | 
        'ml_training' | 'molecular_dynamics' | 'data_analysis' | 'custom';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  progress: DynamicField<number>;
  startTime: Date;
  endTime?: Date;
  estimatedTime?: number; // seconds
  computeUnits: DynamicField<number>;
  memoryUsed: DynamicField<number>;
  gpuAllocated: DynamicField<number>;
  logs: LogEntry[];
  resultUrl?: string;
  errorMessage?: string;
  costEstimate?: number;
  tier: 'free' | 'pro' | 'enterprise';
}

export interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  message: string;
}

export interface ComputeNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  gpus: number;
  runningJobs: number;
}

// Workspace types
export interface WorkspaceFile {
  id: string;
  name: DynamicField<string>;
  content: DynamicField<string>;
  language: 'python' | 'sql' | 'r' | 'markdown' | 'javascript' | 'bash' | 'java' | 'cpp' | 'typescript';
  isModified: DynamicField<boolean>;
  createdAt: Date;
  lastModified: Date;
  executionResult?: ExecutionResult;
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  status: 'success' | 'error' | 'timeout';
  charts?: ChartData[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'scatter' | 'heatmap' | 'pie';
  data: unknown[];
  config: Record<string, unknown>;
}

// Query/Search types
export interface SavedQuery {
  id: string;
  name: DynamicField<string>;
  sql: DynamicField<string>;
  description: DynamicField<string>;
  lastRun?: Date;
  runCount: DynamicField<number>;
  results?: QueryResult;
  dataSource: string;
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  executionTime: number;
  rowCount: number;
  source: 'local' | 'api' | 'cached' | 'synthetic';
  truncated: boolean;
  exportFormats: string[];
}

// Knowledge Graph types
export interface GraphNode {
  id: string;
  label: DynamicField<string>;
  type: 'concept' | 'paper' | 'author' | 'gene' | 'compound' | 'domain' | 'dataset';
  x: number;
  y: number;
  connections: number;
  details?: Record<string, unknown>;
  importance: number; // 0-1 for sizing
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  label?: string;
  type: 'cites' | 'related' | 'author_of' | 'contains' | 'similar_to';
}

// Collaboration types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  online: boolean;
  lastActive: Date;
  expertise: string[];
  publicationsCount: number;
}

export interface Project {
  id: string;
  name: DynamicField<string>;
  description: DynamicField<string>;
  memberIds: string[];
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: Date;
  lastActivity: Date;
  leadId: string;
  datasetIds: string[];
  queryIds: string[];
  visibility: 'public' | 'private' | 'team';
}

export interface DiscussionThread {
  id: string;
  title: DynamicField<string>;
  authorId: string;
  projectId?: string;
  tags: string[];
  replyCount: number;
  createdAt: Date;
  lastReply: Date;
  content: DynamicField<string>;
  replies: Reply[];
}

export interface Reply {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  reactions: Record<string, number>; // emoji → count
}

// AETHEL AI types
export interface AethelModel {
  id: string;
  name: string;
  parameters: string; // e.g., "7B", "70B"
  specialty: string;
  speed: 'fast' | 'medium' | 'slow';
  available: boolean;
  description: string;
  inputCost: number; // per 1K tokens
  outputCost: number;
  maxTokens: number;
  tier: 'free' | 'pro' | 'enterprise';
}

export interface AethelQuery {
  id: string;
  modelId: string;
  prompt: DynamicField<string>;
  response: DynamicField<string>;
  tokensUsed: DynamicField<number>;
  computeTime: DynamicField<number>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  budget: DynamicField<number>;
  timestamp: Date;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'rate_limited';
  error?: string;
}

// Workflow types
export interface WorkflowDefinition {
  id: string;
  name: DynamicField<string>;
  description: DynamicField<string>;
  status: 'draft' | 'active' | 'running' | 'completed' | 'error' | 'paused';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  lastRun?: Date;
  schedule?: string;
  tier: 'free' | 'pro' | 'enterprise';
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
  status: 'idle' | 'running' | 'complete' | 'error' | 'skipped';
  inputSchema?: unknown[];
  outputSchema?: unknown[];
}

export interface WorkflowEdge {
  source: string;
  target: string;
  condition?: string;
}

// Call-for-Action / Upgrade Prompt types
export interface UpgradePrompt {
  id: string;
  type: 'storage' | 'compute' | 'api_rate' | 'collaboration' | 'ai_tokens' | 
        'export_format' | 'workflow_automation' | 'realtime_collab';
  title: string;
  message: string;
  currentValue: number;
  limitValue: number;
  unit: string;
  severity: 'info' | 'warning' | 'critical';
  dismissed: boolean;
  dismissUntil?: Date;
  actionUrl: string;
  actionLabel: string;
  alternativeAction?: string;
  shownAt: Date;
  converted?: boolean;
}

// Guidance/Suggestion types (Progressive Discovery)
export interface GuidanceSuggestion {
  id: string;
  type: 'next_step' | 'tip' | 'feature_discovery' | 'best_practice' | 'shortcut';
  title: string;
  message: string;
  icon: string;
  targetRoute?: string;
  targetAction?: string;
  context: string; // where this appears
  priority: number; // 1-10
  dismissed: boolean;
  shownCount: number;
  maxShows: number;
}

// Notification types
export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'job_complete' | 
        'collaboration' | 'system' | 'upgrade_available' | 'milestone';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Search History
export interface SearchHistoryEntry {
  id: string;
  query: string;
  source: string;
  filters?: Record<string, unknown>;
  resultCount: number;
  timestamp: Date;
}

// Saved Items (papers, datasets, etc.)
export interface SavedItem {
  id: string;
  type: 'paper' | 'dataset' | 'gene' | 'compound' | 'protein' | 'query' | 'job' | 'workflow' | 'file';
  title: string;
  source: string;
  metadata: Record<string, unknown>;
  savedAt: Date;
  tags: string[];
  notes?: string;
  accessCount: number;
  lastAccessed?: Date;
}

// Database Configuration
export interface DatabaseConfig {
  provider: 'localStorage' | 'IndexedDB' | 'DuckDB' | 'PostgreSQL' | 'MySQL';
  enabled: boolean;
  connectionString?: string;
  autoPushThreshold: DynamicField<number>; // bytes
  lastPush?: Date;
  pushInProgress: boolean;
  syncInterval: number; // minutes
  tables: string[];
}

// Volume Tier System
export interface VolumeTier {
  tier: 1 | 2 | 3 | 4;
  name: string;
  maxSize: number; // bytes
  storageType: 'localStorage' | 'IndexedDB' | 'DuckDB-WASM' | 'Cloud';
  features: string[];
  upgradePrompt?: string;
  callToAction?: string;
}

// ============================================================================
// VOLUME TIERS CONFIGURATION (Call-for-Action Triggers)
// ============================================================================

export const VOLUME_TIERS: VolumeTier[] = [
  {
    tier: 1,
    name: 'Starter (Free)',
    maxSize: 5 * 1024 * 1024, // 5MB
    storageType: 'localStorage',
    features: ['Basic search', 'Save up to 50 items', '3 active jobs', 'Community support'],
    upgradePrompt: '📊 You\'re approaching the 5MB free tier limit',
    callToAction: 'Unlock 100MB with Pro tier',
  },
  {
    tier: 2,
    name: 'Researcher (Free)',
    maxSize: 100 * 1024 * 1024, // 100MB
    storageType: 'IndexedDB',
    features: ['Everything in Starter', 'Save up to 500 items', '10 active jobs', 'Export to CSV/JSON'],
    upgradePrompt: '💾 Your dataset exceeds 100MB - time to level up!',
    callToAction: 'Get 10GB storage with Pro',
  },
  {
    tier: 3,
    name: 'Pro ($9/month)',
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
    storageType: 'DuckDB-WASM',
    features: ['Everything in Researcher', 'Unlimited saves', '50 concurrent jobs', 'SQL queries', 'Priority compute', 'DuckDB analytics'],
    upgradePrompt: '🚀 Power user detected! Unlock cloud-scale computing.',
    callToAction: 'Upgrade to Enterprise for unlimited scale',
  },
  {
    tier: 4,
    name: 'Enterprise ($49/month)',
    maxSize: Infinity,
    storageType: 'Cloud',
    features: ['Everything in Pro', 'Unlimited everything', 'Real-time collaboration', 'Custom models', 'SLA guarantee', 'Dedicated support'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper functions are now in useDynamicStore.ts to avoid duplication
// Only import updateDynamicField (createDynamicField is defined locally in useDynamicStore)
export { updateDynamicField } from './useDynamicStore';

/**
 * Generates a unique ID for records
 */
// SYNTHETIC DATA GENERATORS (Pre-seeding for Zero Friction Onboarding)
// ============================================================================

const generateSyntheticDatasets = (): DatasetItem[] => [
  {
    id: 'ds-001',
    name: createDynamicField('TCGA Pan-Cancer Expression Atlas'),
    description: createDynamicField('RNA-seq expression data across 33 cancer types from The Cancer Genome Atlas. Contains normalized counts, FPKM values, and clinical annotations for comprehensive oncology research.'),
    size: createDynamicField('4.2 GB'),
    sizeBytes: createDynamicField(4509715660),
    rows: createDynamicField(11234),
    columns: createDynamicField(20500),
    type: createDynamicField('Genomics'),
    format: createDynamicField('Parquet'),
    sourceUrl: createDynamicField('https://portal.gdc.cancer.gov/'),
    tags: createDynamicField(['cancer', 'rna-seq', 'expression', 'clinical', 'tcga', 'oncology']),
    lastModified: createDynamicField(new Date('2024-12-15')),
    isPublic: createDynamicField(true),
    isFavorite: createDynamicField(false),
    downloaded: createDynamicField(false),
    downloadProgress: createDynamicField(0),
    createdAt: new Date('2024-01-15'),
    storageLayer: 'indexeddb',
    volumeTier: 3,
  },
  {
    id: 'ds-002',
    name: createDynamicField('Human Protein Atlas v22'),
    description: createDynamicField('Comprehensive protein expression profiles across human tissues, cell lines, and pathology samples. Includes tissue specificity scores and subcellular localization data.'),
    size: createDynamicField('1.8 GB'),
    sizeBytes: createDynamicField(1932735283),
    rows: createDynamicField(44200),
    columns: createDynamicField(1500),
    type: createDynamicField('Proteomics'),
    format: createDynamicField('HDF5'),
    sourceUrl: createDynamicField('https://www.proteinatlas.org/'),
    tags: createDynamicField(['proteins', 'tissues', 'expression', 'human', 'antibody']),
    lastModified: createDynamicField(new Date('2024-11-28')),
    isPublic: createDynamicField(true),
    isFavorite: createDynamicField(true),
    downloaded: createDynamicField(true),
    downloadProgress: createDynamicField(100),
    createdAt: new Date('2024-02-20'),
    storageLayer: 'local',
    volumeTier: 2,
  },
  {
    id: 'ds-003',
    name: createDynamicField('ChEMBL Bioactivity Database'),
    description: createDynamicField('Curated bioactivity data for over 2 million compounds with binding assays, target relationships, and drug-like properties. Essential for computational drug discovery.'),
    size: createDynamicField('890 MB'),
    sizeBytes: createDynamicField(933231816),
    rows: createDynamicField(2050000),
    columns: createDynamicField(45),
    type: createDynamicField('Chemoinformatics'),
    format: createDynamicField('CSV'),
    sourceUrl: createDynamicField('https://www.ebi.ac.uk/chembl/'),
    tags: createDynamicField(['compounds', 'bioactivity', 'drug-discovery', 'binding', 'ic50']),
    lastModified: createDynamicField(new Date('2024-12-10')),
    isPublic: createDynamicField(true),
    isFavorite: createDynamicField(false),
    downloaded: createDynamicField(false),
    downloadProgress: createDynamicField(0),
    createdAt: new Date('2024-03-10'),
    storageLayer: 'indexeddb',
    volumeTier: 2,
  },
  {
    id: 'ds-004',
    name: createDynamicField('RCSB PDB Structure Collection'),
    description: createDynamicField('3D structural data of proteins, nucleic acids, and complexes determined by X-ray crystallography, NMR, and cryo-EM. Includes experimental method and resolution.'),
    size: createDynamicField('2.1 GB'),
    sizeBytes: createDynamicField(2254857830),
    rows: createDynamicField(185000),
    columns: createDynamicField(85),
    type: createDynamicField('Structural Biology'),
    format: createDynamicField('mmCIF'),
    sourceUrl: createDynamicField('https://www.rcsb.org/'),
    tags: createDynamicField(['structures', 'pdb', '3d', 'proteins', 'ligands', 'cryo-em']),
    lastModified: createDynamicField(new Date('2024-12-18')),
    isPublic: createDynamicField(true),
    isFavorite: createDynamicField(false),
    downloaded: createDynamicField(false),
    downloadProgress: createDynamicField(0),
    createdAt: new Date('2024-04-05'),
    storageLayer: 'indexeddb',
    volumeTier: 3,
  },
  {
    id: 'ds-005',
    name: createDynamicField('gnomAD v3.1.2 Variant Frequencies'),
    description: createDynamicField('Genome aggregation database containing allele frequencies from 141,456 whole genomes and 15,708 whole exomes. Includes quality metrics and ancestry labels.'),
    size: createDynamicField('6.7 GB'),
    sizeBytes: createDynamicField(7196028505),
    rows: createDynamicField(246000000),
    columns: createDynamicField(32),
    type: createDynamicField('Population Genetics'),
    format: createDynamicField('BCF'),
    sourceUrl: createDynamicField('https://gnomad.broadinstitute.org/'),
    tags: createDynamicField(['variants', 'frequencies', 'population', 'genomics', 'allele']),
    lastModified: createDynamicField(new Date('2024-10-03')),
    isPublic: createDynamicField(true),
    isFavorite: createDynamicField(true),
    downloaded: createDynamicField(false),
    downloadProgress: createDynamicField(0),
    createdAt: new Date('2024-05-12'),
    storageLayer: 'duckdb',
    volumeTier: 4,
  },
  {
    id: 'ds-006',
    name: createDynamicField('arXiv ML Papers Corpus (2020-2024)'),
    description: createDynamicField('Machine learning paper abstracts, metadata, and citation networks extracted from arXiv cs.LG category with NLP processing for topic modeling.'),
    size: createDynamicField('340 MB'),
    sizeBytes: createDynamicField(356515840),
    rows: createDynamicField(89000),
    columns: createDynamicField(25),
    type: createDynamicField('Literature'),
    format: createDynamicField('JSONL'),
    sourceUrl: createDynamicField('https://arxiv.org/list/cs.LG/recent'),
    tags: createDynamicField(['machine-learning', 'papers', 'citations', 'nlp', 'topic-modeling']),
    lastModified: createDynamicField(new Date('2024-12-19')),
    isPublic: createDynamicField(true),
    isFavorite: createDynamicField(false),
    downloaded: createDynamicField(true),
    downloadProgress: createDynamicField(100),
    createdAt: new Date('2024-06-18'),
    storageLayer: 'local',
    volumeTier: 1,
  },
  {
    id: 'ds-007',
    name: createDynamicField('Materials Project Crystal Structures'),
    description: createDynamicField('Computed crystal structures, formation energies, and electronic properties for ~150,000 inorganic materials from DFT calculations.'),
    size: createDynamicField('1.2 GB'),
    sizeBytes: createDynamicField(1288490188),
    rows: createDynamicField(152000),
    columns: createDynamicField(62),
    type: createDynamicField('Materials Science'),
    format: createDynamicField('JSON'),
    sourceUrl: createDynamicField('https://materialsproject.org/'),
    tags: createDynamicField(['materials', 'crystals', 'dft', 'electronic', 'bandgap']),
    lastModified: createDynamicField(new Date('2024-12-14')),
    isPublic: createDynamicField(true),
    isFavorite: createDynamicField(false),
    downloaded: createDynamicField(false),
    downloadProgress: createDynamicField(0),
    createdAt: new Date('2024-07-22'),
    storageLayer: 'indexeddb',
    volumeTier: 2,
  },
  {
    id: 'ds-008',
    name: createDynamicField('GEO Transcriptomic Series'),
    description: createDynamicField('Curated gene expression omnibus series with processed matrices, sample metadata, and experimental designs for differential expression analysis.'),
    size: createDynamicField('3.4 GB'),
    sizeBytes: createDynamicField(3650722201),
    rows: createDynamicField(45000),
    columns: createDynamicField(28000),
    type: createDynamicField('Transcriptomics'),
    format: createDynamicField('SOFT'),
    sourceUrl: createDynamicField('https://www.ncbi.nlm.nih.gov/geo/'),
    tags: createDynamicField(['geo', 'expression', 'transcriptomics', 'microarray', 'differential']),
    lastModified: createDynamicField(new Date('2024-12-08')),
    isPublic: createDynamicField(true),
    isFavorite: createDynamicField(false),
    downloaded: createDynamicField(false),
    downloadProgress: createDynamicField(0),
    createdAt: new Date('2024-08-30'),
    storageLayer: 'indexeddb',
    volumeTier: 3,
  },
];

const generateSyntheticConnectors = (): ConnectorConfig[] => [
  {
    id: 'ncbi-genbank',
    name: 'NCBI GenBank',
    category: 'biological',
    isEnabled: createDynamicField(true),
    isConnected: createDynamicField(true),
    syncStatus: 'success',
    recordCount: createDynamicField(250000000),
    apiEndpoint: createDynamicField('https://api.ncbi.nlm.nih.gov/datasets/v2'),
    apiKey: createDynamicField(''),
    freeTierLimit: 3,
    isFreeTier: true,
    features: ['Sequence retrieval', 'Genome downloads', 'Literature linking', 'Taxonomy lookup'],
    lastSync: new Date(),
    latency: 245,
    dataTypes: ['sequences', 'genomes', 'literature', 'taxonomies'],
  },
  {
    id: 'rcsb-pdb',
    name: 'RCSB Protein Data Bank',
    category: 'biological',
    isEnabled: createDynamicField(true),
    isConnected: createDynamicField(true),
    syncStatus: 'success',
    recordCount: createDynamicField(185000),
    apiEndpoint: createDynamicField('https://data.rcsb.org/rest/v1/core/entry'),
    apiKey: createDynamicField(''),
    freeTierLimit: 5,
    isFreeTier: true,
    features: ['3D structures', 'Ligand binding', 'Sequence alignment', 'Visualization'],
    lastSync: new Date(Date.now() - 3600000),
    latency: 180,
    dataTypes: ['structures', 'proteins', 'complexes', 'ligands'],
  },
  {
    id: 'uniprot',
    name: 'UniProtKB',
    category: 'biological',
    isEnabled: createDynamicField(true),
    isConnected: createDynamicField(false),
    syncStatus: 'idle',
    recordCount: createDynamicField(247000000),
    apiEndpoint: createDynamicField('https://rest.uniprot.org/uniprotkb'),
    apiKey: createDynamicField(''),
    freeTierLimit: 15,
    isFreeTier: true,
    features: ['Protein sequences', 'Function annotation', 'Pathway mapping', 'Variant data'],
    dataTypes: ['protein-sequences', 'annotations', 'functions', 'pathways'],
  },
  {
    id: 'pubchem',
    name: 'PubChem',
    category: 'chemical',
    isEnabled: createDynamicField(true),
    isConnected: createDynamicField(true),
    syncStatus: 'success',
    recordCount: createDynamicField(111000000),
    apiEndpoint: createDynamicField('https://pubchem.ncbi.nlm.nih.gov/rest/pug'),
    apiKey: createDynamicField(''),
    freeTierLimit: 5,
    isFreeTier: true,
    features: ['Compound search', 'Bioassay data', 'Properties', 'Structure similarity'],
    lastSync: new Date(Date.now() - 7200000),
    latency: 320,
    dataTypes: ['compounds', 'substances', 'bioassays', 'properties'],
  },
  {
    id: 'crossref',
    name: 'CrossRef',
    category: 'literature',
    isEnabled: createDynamicField(true),
    isConnected: createDynamicField(true),
    syncStatus: 'success',
    recordCount: createDynamicField(138000000),
    apiEndpoint: createDynamicField('https://api.crossref.org/works'),
    apiKey: createDynamicField(''),
    freeTierLimit: 50,
    isFreeTier: true,
    features: ['DOI metadata', 'Citation links', 'Funder info', 'ORCID integration'],
    lastSync: new Date(Date.now() - 1800000),
    latency: 150,
    dataTypes: ['doi-metadata', 'citations', 'references', 'funder-info'],
  },
  {
    id: 'arxiv',
    name: 'arXiv Preprints',
    category: 'literature',
    isEnabled: createDynamicField(true),
    isConnected: createDynamicField(true),
    syncStatus: 'success',
    recordCount: createDynamicField(2400000),
    apiEndpoint: createDynamicField('http://export.arxiv.org/api/query'),
    apiKey: createDynamicField(''),
    freeTierLimit: 0,
    isFreeTier: true,
    features: ['Preprints', 'Metadata', 'Categories', 'Full-text PDF'],
    lastSync: new Date(Date.now() - 900000),
    latency: 890,
    dataTypes: ['preprints', 'metadata', 'categories', 'full-text'],
  },
  {
    id: 'openalex',
    name: 'OpenAlex',
    category: 'literature',
    isEnabled: createDynamicField(true),
    isConnected: createDynamicField(true),
    syncStatus: 'success',
    recordCount: createDynamicField(250000000),
    apiEndpoint: createDynamicField('https://api.openalex.org/works'),
    apiKey: createDynamicField(''),
    freeTierLimit: 10,
    isFreeTier: true,
    features: ['Works catalog', 'Author profiles', 'Concepts', 'Institutions'],
    lastSync: new Date(Date.now() - 3600000),
    latency: 210,
    dataTypes: ['works', 'authors', 'concepts', 'institutions'],
  },
];

const generateSyntheticJobs = (): ComputeJob[] => [
  {
    id: 'job-001',
    name: createDynamicField('GATK Variant Calling Pipeline'),
    type: 'variant_calling',
    status: 'running',
    priority: 'high',
    progress: createDynamicField(67),
    startTime: new Date(Date.now() - 7200000),
    estimatedTime: 10800,
    computeUnits: createDynamicField(32),
    memoryUsed: createDynamicField(58),
    gpuAllocated: createDynamicField(0),
    logs: [
      { timestamp: new Date(Date.now() - 7200000), level: 'INFO', message: 'Initializing GATK 4.4.0.0 HaplotypeCaller...' },
      { timestamp: new Date(Date.now() - 7150000), level: 'INFO', message: 'Loading reference genome GRCh38.p14 (3.2GB)...' },
      { timestamp: new Date(Date.now() - 7000000), level: 'INFO', message: 'Processing BAM file: sample_WGS_01.bam (~45x coverage)' },
      { timestamp: new Date(Date.now() - 3600000), level: 'WARN', message: 'Low coverage region detected on chr17:41,196,312-41,279,500 (TP53 locus)' },
      { timestamp: new Date(Date.now() - 600000), level: 'DEBUG', message: 'Active region calculation complete: 847 regions identified' },
      { timestamp: new Date(Date.now() - 300000), level: 'INFO', message: 'Haplotype assembly progress: 67% (567/847 regions)' },
    ],
    costEstimate: 12.50,
    tier: 'free',
  },
  {
    id: 'job-002',
    name: createDynamicField('AlphaFold2 Protein Structure Prediction'),
    type: 'protein_folding',
    status: 'running',
    priority: 'normal',
    progress: createDynamicField(34),
    startTime: new Date(Date.now() - 5400000),
    estimatedTime: 14400,
    computeUnits: createDynamicField(64),
    memoryUsed: createDynamicField(82),
    gpuAllocated: createDynamicField(4),
    logs: [
      { timestamp: new Date(Date.now() - 5400000), level: 'INFO', message: 'AlphaFold2 v2.3.2 initialized with model parameters (2.5GB)' },
      { timestamp: new Date(Date.now() - 5300000), level: 'INFO', message: 'Running MSA search against UniRef30, BFD, MGnify...' },
      { timestamp: new Date(Date.now() - 4800000), level: 'INFO', message: 'MSA complete: 14,232 sequences found, depth=512' },
      { timestamp: new Date(Date.now() - 3600000), level: 'INFO', message: 'Evoformer iteration 24/48 - computing pair representations' },
      { timestamp: new Date(Date.now() - 1200000), level: 'DEBUG', message: 'Structure module generating 3D coordinates (recycle #3)' },
      { timestamp: new Date(Date.now() - 600000), level: 'INFO', message: 'Confidence prediction pLDDT: 92.3 (estimated)' },
    ],
    costEstimate: 28.00,
    tier: 'pro',
  },
  {
    id: 'job-003',
    name: createDynamicField('Virtual Screening - ChEMBL Library'),
    type: 'drug_screening',
    status: 'queued',
    priority: 'normal',
    progress: createDynamicField(0),
    startTime: new Date(),
    estimatedTime: 21600,
    computeUnits: createDynamicField(128),
    memoryUsed: createDynamicField(0),
    gpuAllocated: createDynamicField(8),
    logs: [
      { timestamp: new Date(), level: 'INFO', message: 'Job queued. Waiting for GPU cluster availability...' },
    ],
    costEstimate: 45.00,
    tier: 'pro',
  },
  {
    id: 'job-004',
    name: createDynamicField('Random Forest Classifier Training'),
    type: 'ml_training',
    status: 'completed',
    priority: 'low',
    progress: createDynamicField(100),
    startTime: new Date(Date.now() - 18000000),
    endTime: new Date(Date.now() - 3600000),
    estimatedTime: 14400,
    computeUnits: createDynamicField(16),
    memoryUsed: createDynamicField(0),
    gpuAllocated: createDynamicField(1),
    logs: [
      { timestamp: new Date(Date.now() - 18000000), level: 'INFO', message: 'Scikit-learn Random Forest training initiated' },
      { timestamp: new Date(Date.now() - 17800000), level: 'INFO', message: 'Loading training set: 50,000 samples × 256 features' },
      { timestamp: new Date(Date.now() - 17500000), level: 'INFO', message: 'Hyperparameters: n_estimators=500, max_depth=20, criterion=gini' },
      { timestamp: new Date(Date.now() - 14000000), level: 'INFO', message: 'Training fold 4/5 (cross-validation)...' },
      { timestamp: new Date(Date.now() - 9000000), level: 'INFO', message: 'Feature importance computed. Top 10 features selected.' },
      { timestamp: new Date(Date.now() - 3600000), level: 'SUCCESS', message: 'Training complete! Accuracy: 94.7%, AUC: 0.967, F1: 0.943' },
    ],
    resultUrl: '/storage/results/job-004-model.pkl',
    costEstimate: 8.50,
    tier: 'free',
  },
  {
    id: 'job-005',
    name: createDynamicField('Molecular Dynamics Simulation'),
    type: 'molecular_dynamics',
    status: 'failed',
    priority: 'high',
    progress: createDynamicField(42),
    startTime: new Date(Date.now() - 10800000),
    endTime: new Date(Date.now() - 3600000),
    estimatedTime: 28800,
    computeUnits: createDynamicField(96),
    memoryUsed: createDynamicField(0),
    gpuAllocated: createDynamicField(8),
    errorMessage: 'GPU out-of-memory at step 2,400,000 (frame 48ns). Reduce system size or increase GPU memory allocation.',
    logs: [
      { timestamp: new Date(Date.now() - 10800000), level: 'INFO', message: 'GROMACS 2024.3 MD simulation initialized' },
      { timestamp: new Date(Date.now() - 10700000), level: 'INFO', message: 'System: 156,432 atoms, 45,892 water molecules, PME electrostatics' },
      { timestamp: new Date(Date.now() - 10400000), level: 'INFO', message: 'Energy minimization converged after 5,124 steps' },
      { timestamp: new Date(Date.now() - 10000000), level: 'INFO', message: 'NPT equilibration complete. Production run starting...' },
      { timestamp: new Date(Date.now() - 7200000), level: 'ERROR', message: 'CUDA error: out of memory. GPU has 80GB, need ~96GB.' },
    ],
    costEstimate: 0, // Refunded on failure
    tier: 'pro',
  },
];

const generateSyntheticWorkspaceFiles = (): WorkspaceFile[] => [
  {
    id: 'file-001',
    name: createDynamicField('analysis_pipeline.py'),
    content: createDynamicField(`# SciHub Pro Analysis Pipeline
# This template helps you get started with data analysis

import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

def load_dataset(dataset_id: str) -> pd.DataFrame:
    """Load a dataset from the SciHub Pro data lake."""
    # TODO: Replace with actual data loading logic
    print(f"Loading dataset: {dataset_id}")
    return pd.DataFrame()

def analyze_expression(data: pd.DataFrame, gene_column: str = 'gene_name'):
    """Perform basic expression analysis."""
    stats_summary = data.describe()
    
    # Find differentially expressed genes
    # TODO: Add your differential expression logic here
    
    return stats_summary

def plot_results(results, output_path: str = 'results.png'):
    """Visualize analysis results."""
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    
    # TODO: Customize your visualizations
    
    plt.tight_layout()
    plt.savefig(output_path)
    print(f"Plot saved to {output_path}")

# Main execution
if __name__ == "__main__":
    # Load your dataset
    df = load_dataset("ds-001")  # TCGA Pan-Cancer dataset
    
    # Run analysis
    results = analyze_expression(df)
    print(results)
    
    # Generate plots
    plot_results(results)
`),
    language: 'python',
    isModified: createDynamicField(false),
    createdAt: new Date(Date.now() - 86400000),
    lastModified: new Date(Date.now() - 3600),
  },
  {
    id: 'file-002',
    name: createDynamicField('query_examples.sql'),
    content: createDynamicField(`-- SciHub Pro SQL Query Examples
-- Use these templates to query your datasets

-- Example 1: Basic dataset overview
SELECT 
    COUNT(*) as total_rows,
    COUNT(DISTINCT column_name) as unique_values
FROM dataset_table;

-- Example 2: Filter by conditions
SELECT *
FROM gene_expression
WHERE expression_value > 10
    AND p_value < 0.05
ORDER BY expression_value DESC
LIMIT 100;

-- Example 3: Aggregation with grouping
SELECT 
    gene_pathway,
    AVG(expression) as mean_expression,
    STDDEV(expression) as std_expression,
    COUNT(*) as gene_count
FROM gene_expression
GROUP BY gene_pathway
HAVING COUNT(*) > 5
ORDER BY mean_expression DESC;

-- Example 4: Join datasets
SELECT 
    g.gene_name,
    g.expression_value,
    p.protein_function,
    c.compound_name
FROM gene_expression g
JOIN protein_annotations p ON g.gene_id = p.gene_id
JOIN compound_bindings c ON p.protein_id = c.target_protein
WHERE g.tumor_type = 'BRCA';
`),
    language: 'sql',
    isModified: createDynamicField(false),
    createdAt: new Date(Date.now() - 172800000),
    lastModified: new Date(Date.now() - 86400),
  },
  {
    id: 'file-003',
    name: createDynamicField('notes.md'),
    content: createDynamicField(`# Research Notes

## Project Overview
- **Goal**: Identify potential drug targets in breast cancer
- **Data Sources**: TCGA, ChEMBL, Protein Atlas
- **Timeline**: Q1 2025

## Key Findings
1. TP53 mutations in 45% of samples
2. Overexpression of HER2 in 20% of cases
3. Potential compound matches: 12 candidates

## Next Steps
- [ ] Validate top 5 compounds in vitro
- [ ] Write methods section
- [ ] Prepare figures for publication

## References
- Smith et al. (2024) Nature Methods
- Johnson et al. (2023) Cell Systems
`),
    language: 'markdown',
    isModified: createDynamicField(true),
    createdAt: new Date(Date.now() - 259200000),
    lastModified: new Date(),
  },
];

const generateSyntheticQueries = (): SavedQuery[] => [
  {
    id: 'query-001',
    name: createDynamicField('Highly Cited Cancer Papers'),
    sql: createDynamicField('SELECT * FROM papers WHERE subject LIKE "%cancer%" AND citations > 100 ORDER BY citations DESC LIMIT 50'),
    description: createDynamicField('Find highly cited cancer research papers from CrossRef/OpenAlex'),
    runCount: createDynamicField(15),
    lastRun: new Date(Date.now() - 3600000),
    dataSource: 'crossref',
  },
  {
    id: 'query-002',
    name: createDynamicField('Gene Expression Outliers'),
    sql: createDynamicField('SELECT gene_name, expression, z_score FROM expression_data WHERE ABS(z_score) > 2 ORDER BY z_score DESC'),
    description: createDynamicField('Identify genes with outlier expression values (|z| > 2)'),
    runCount: createDynamicField(8),
    lastRun: new Date(Date.now() - 86400),
    dataSource: 'local',
  },
  {
    id: 'query-003',
    name: createDynamicField('Compound Bioactivity Screen'),
    sql: createDynamicField('SELECT compound_id, ic50, target_name, assay_type FROM chembl_bioactivity WHERE ic50 < 1000 ORDER BY ic50 ASC LIMIT 100'),
    description: createDynamicField('Screen ChEMBL for high-affinity compounds (IC50 < 1μM)'),
    runCount: createDynamicField(3),
    dataSource: 'chembl',
  },
];

const generateSyntheticGuidance = (): GuidanceSuggestion[] => [
  {
    id: 'guide-001',
    type: 'next_step',
    title: 'Try Citation Analysis',
    message: 'You\'ve searched for papers. Click to see who cited them and build your literature review.',
    icon: '📚',
    targetRoute: '/knowledge',
    context: 'search',
    priority: 8,
    dismissed: false,
    shownCount: 0,
    maxShows: 3,
  },
  {
    id: 'guide-002',
    type: 'feature_discovery',
    title: 'Run Your First Analysis',
    message: 'Your dataset is ready! Use the workspace to write Python/R code and analyze it interactively.',
    icon: '🚀',
    targetRoute: '/workspace',
    context: 'data',
    priority: 9,
    dismissed: false,
    shownCount: 0,
    maxShows: 5,
  },
  {
    id: 'guide-003',
    type: 'tip',
    title: 'Keyboard Shortcut',
    message: 'Press Ctrl+Enter to execute code instantly in the workspace editor.',
    icon: '⌨️',
    context: 'workspace',
    priority: 5,
    dismissed: false,
    shownCount: 0,
    maxShows: 3,
  },
  {
    id: 'guide-004',
    type: 'best_practice',
    title: 'Save Your Progress',
    message: 'Great work so far! Save this query to reuse it later and track your analysis history.',
    icon: '💾',
    targetAction: 'save_query',
    context: 'query',
    priority: 7,
    dismissed: false,
    shownCount: 0,
    maxShows: 3,
  },
  {
    id: 'guide-005',
    type: 'feature_discovery',
    title: 'AI Assistant Available',
    message: 'Stuck on something? Ask AETHEL AI to help explain concepts or generate code.',
    icon: '🤖',
    targetRoute: '/aethel',
    context: 'global',
    priority: 6,
    dismissed: false,
    shownCount: 0,
    maxShows: 4,
  },
];

const generateSyntheticNotifications = (): NotificationItem[] => [
  {
    id: 'notif-001',
    type: 'job_complete',
    title: 'Analysis Complete',
    message: 'Your Random Forest Classifier training finished with 94.7% accuracy!',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    actionUrl: '/compute',
    actionLabel: 'View Results',
    priority: 'high',
  },
  {
    id: 'notif-002',
    type: 'collaboration',
    title: 'New Team Member',
    message: 'Dr. Sarah Chen joined your Oncology Research project.',
    timestamp: new Date(Date.now() - 7200000),
    read: false,
    actionUrl: '/collaboration',
    actionLabel: 'Say Hi',
    priority: 'medium',
  },
  {
    id: 'notif-003',
    type: 'milestone',
    title: '100 Searches Milestone!',
    message: 'Congratulations! You\'ve performed 100 searches. Keep exploring!',
    timestamp: new Date(Date.now() - 86400000),
    read: true,
    priority: 'low',
  },
  {
    id: 'notif-004',
    type: 'system',
    title: 'New Datasets Available',
    message: '5 new datasets were added to the Data Lake this week. Check them out!',
    timestamp: new Date(Date.now() - 172800000),
    read: true,
    actionUrl: '/data',
    actionLabel: 'Browse Data',
    priority: 'low',
  },
];

// ============================================================================
// MAIN STORE INTERFACE & IMPLEMENTATION
// ============================================================================

interface SciHubStore {
  // === USER STATE ===
  preferences: UserPreferences;
  userProfile: UserProfile;
  
  // === DASHBOARD STATE ===
  dashboardStats: DashboardStats;
  activities: ActivityEntry[];
  
  // === DATA LAKE STATE ===
  datasets: DatasetItem[];
  totalStorageUsed: number;
  
  // === CONNECTORS STATE ===
  connectors: ConnectorConfig[];
  
  // === COMPUTE STATE ===
  computeJobs: ComputeJob[];
  computeNodes: ComputeNode[];
  
  // === WORKSPACE STATE ===
  workspaceFiles: WorkspaceFile[];
  activeFileId: string | null;
  
  // === QUERY STATE ===
  savedQueries: SavedQuery[];
  currentQueryResult: QueryResult | null;
  isExecutingQuery: boolean;
  
  // === KNOWLEDGE GRAPH STATE ===
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  
  // === COLLABORATION STATE ===
  projects: Project[];
  teamMembers: TeamMember[];
  discussions: DiscussionThread[];
  
  // === AETHEL AI STATE ===
  aethelModels: AethelModel[];
  aethelQueries: AethelQuery[];
  activeAethelQuery: string | null;
  
  // === WORKFLOW STATE ===
  workflows: WorkflowDefinition[];
  
  // === NOTIFICATIONS & GUIDANCE ===
  notifications: NotificationItem[];
  guidanceSuggestions: GuidanceSuggestion[];
  upgradePrompts: UpgradePrompt[];
  unreadNotificationCount: number;
  
  // === SEARCH HISTORY ===
  searchHistory: SearchHistoryEntry[];
  savedItems: SavedItem[];
  
  // === DATABASE CONFIG ===
  databaseConfig: DatabaseConfig;
  currentVolumeTier: VolumeTier;
  
  // === UI STATE ===
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  modals: Record<string, boolean>;
  loadingStates: Record<string, boolean>;
  errors: Record<string, string | null>;
  
  // === PREFERENCES ACTIONS ===
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (lang: string) => void;
  setSkillLevel: (level: UserPreferences['skillLevel']) => void;
  
  // === PROFILE ACTIONS ===
  updateUserProfile: (field: keyof UserProfile, value: any) => void;
  resetProfileChanges: () => void;
  
  // === DASHBOARD ACTIONS ===
  updateDashboardStat: (key: keyof DashboardStats, value: any) => void;
  addActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
  
  // === DATASET ACTIONS ===
  addDataset: (dataset: Omit<DatasetItem, 'id' | 'createdAt'>) => void;
  updateDataset: (id: string, updates: Partial<DatasetItem>) => void;
  deleteDataset: (id: string) => void;
  toggleFavoriteDataset: (id: string) => void;
  startDownload: (id: string) => void;
  updateDownloadProgress: (id: string, progress: number) => void;
  
  // === CONNECTOR ACTIONS ===
  toggleConnector: (id: string) => Promise<void>;
  updateConnectorApiKey: (id: string, key: string) => void;
  syncConnector: (id: string) => Promise<void>;
  syncAllConnectors: () => Promise<void>;
  
  // === COMPUTE ACTIONS ===
  addComputeJob: (job: Omit<ComputeJob, 'id' | 'startTime'>) => void;
  updateJobProgress: (id: string, progress: number) => void;
  cancelJob: (id: string) => void;
  restartJob: (id: string) => void;
  
  // === WORKSPACE ACTIONS ===
  addWorkspaceFile: (file: Omit<WorkspaceFile, 'id' | 'createdAt' | 'lastModified'>) => void;
  updateFileContent: (id: string, content: string) => void;
  setActiveFile: (id: string | null) => void;
  deleteWorkspaceFile: (id: string) => void;
  executeCode: (id: string) => Promise<ExecutionResult>;
  
  // === QUERY ACTIONS ===
  addSavedQuery: (query: Omit<SavedQuery, 'id'>) => void;
  updateSavedQuery: (id: string, updates: Partial<SavedQuery>) => void;
  deleteSavedQuery: (id: string) => void;
  executeSavedQuery: (id: string) => Promise<void>;
  
  // === KNOWLEDGE GRAPH ACTIONS ===
  addGraphNode: (node: Omit<GraphNode, 'id'>) => void;
  addGraphEdge: (edge: GraphEdge) => void;
  clearGraph: () => void;
  
  // === COLLABORATION ACTIONS ===
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'lastActivity'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addDiscussion: (discussion: Omit<DiscussionThread, 'id' | 'createdAt' | 'lastReply'>) => void;
  addReply: (discussionId: string, reply: Omit<Reply, 'id' | 'timestamp'>) => void;
  
  // === AETHEL AI ACTIONS ===
  sendAethelQuery: (modelId: string, prompt: string) => Promise<void>;
  clearAethelHistory: () => void;
  
  // === WORKFLOW ACTIONS ===
  addWorkflow: (workflow: Omit<WorkflowDefinition, 'id' | 'createdAt'>) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowDefinition>) => void;
  runWorkflow: (id: string) => void;
  
  // === NOTIFICATION ACTIONS ===
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  
  // === GUIDANCE ACTIONS ===
  showGuidance: (id: string) => void;
  dismissGuidance: (id: string) => void;
  getRelevantGuidance: (context: string) => GuidanceSuggestion[];
  
  // === UPGRADE PROMPT ACTIONS ===
  checkVolumeThreshold: () => { shouldPrompt: boolean; prompt?: UpgradePrompt };
  dismissUpgradePrompt: (id: string) => void;
  triggerUpgradePrompt: (type: UpgradePrompt['type']) => void;
  
  // === SEARCH & SAVE ACTIONS ===
  addToSearchHistory: (entry: Omit<SearchHistoryEntry, 'id' | 'timestamp'>) => void;
  saveItem: (item: Omit<SavedItem, 'id' | 'savedAt' | 'accessCount'>) => void;
  unsaveItem: (id: string) => void;
  updateSavedItemNotes: (id: string, notes: string) => void;
  
  // === UTILITY ACTIONS ===
  calculateTotalStorage: () => void;
  getCurrentVolumeTier: () => VolumeTier;
  exportState: () => string;
  importState: (json: string) => boolean;
  resetAllFields: () => void;
  getDirtyFieldsCount: () => number;
  
  // === UI ACTIONS ===
  toggleSidebar: () => void;
  setModal: (modalId: string, open: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearErrors: () => void;
}

// Compute Node initial state
const initialComputeNodes = [
  { id: 'node-01', name: 'GPU Cluster A', status: 'online' as const, cpuUsage: 72, memoryUsage: 68, gpuUsage: 85, gpus: 8, runningJobs: 3 },
  { id: 'node-02', name: 'GPU Cluster B', status: 'online' as const, cpuUsage: 45, memoryUsage: 52, gpuUsage: 30, gpus: 4, runningJobs: 1 },
  { id: 'node-03', name: 'CPU Pool', status: 'online' as const, cpuUsage: 88, memoryUsage: 75, gpuUsage: 0, gpus: 0, runningJobs: 5 },
  { id: 'node-04', name: 'Memory Node', status: 'maintenance' as const, cpuUsage: 0, memoryUsage: 0, gpuUsage: 0, gpus: 0, runningJobs: 0 },
];

// AETHEL Models
const initialAethelModels: AethelModel[] = [
  { id: 'aethel-7b', name: 'AETHEL-7B', parameters: '7 Billion', specialty: 'General Science QA', speed: 'fast', available: true, description: 'Fast, efficient model for quick questions and explanations', inputCost: 0, outputCost: 0, maxTokens: 2048, tier: 'free' },
  { id: 'aethel-70b', name: 'AETHEL-70B', parameters: '70 Billion', specialty: 'Deep Research Analysis', speed: 'medium', available: true, description: 'Powerful model for complex analysis and literature synthesis', inputCost: 0.001, outputCost: 0.002, maxTokens: 4096, tier: 'pro' },
  { id: 'aethel-sci', name: 'AETHEL-Science', parameters: '120 Billion', specialty: 'Domain Expert (Bio/Chem/Phys)', speed: 'slow', available: true, description: 'Specialized model trained on scientific literature and databases', inputCost: 0.002, outputCost: 0.004, maxTokens: 8192, tier: 'pro' },
  { id: 'aethel-code', name: 'AETHEL-Code', parameters: '34 Billion', specialty: 'Code Generation & Debugging', speed: 'fast', available: false, description: 'Optimized for Python, R, SQL, and Julia code generation', inputCost: 0.001, outputCost: 0.002, maxTokens: 4096, tier: 'pro' },
];

// Initial team members
const initialTeamMembers: TeamMember[] = [
  { id: 'member-001', name: 'Dr. Sarah Chen', role: 'Principal Investigator', online: true, lastActive: new Date(), expertise: ['Oncology', 'Bioinformatics'], publicationsCount: 45 },
  { id: 'member-002', name: 'Prof. James Wilson', role: 'Co-Investigator', online: false, lastActive: new Date(Date.now() - 7200000), expertise: ['Structural Biology', 'Drug Design'], publicationsCount: 120 },
  { id: 'member-003', name: 'Emily Rodriguez', role: 'Graduate Student', online: true, lastActive: new Date(), expertise: ['Machine Learning', 'Genomics'], publicationsCount: 8 },
  { id: 'member-004', name: 'Dr. Alex Kim', role: 'Postdoctoral Fellow', online: false, lastActive: new Date(Date.now() - 1800000), expertise: ['Chemoinformatics', 'Data Science'], publicationsCount: 22 },
];

// Initial projects
const initialProjects: Project[] = [
  {
    id: 'proj-001',
    name: createDynamicField('Oncology Drug Target Discovery'),
    description: createDynamicField('Identifying novel therapeutic targets for triple-negative breast cancer using multi-omics integration.'),
    memberIds: ['member-001', 'member-002', 'member-003', 'member-004'],
    status: 'active',
    createdAt: new Date(Date.now() - 7776000000),
    lastActivity: new Date(),
    leadId: 'member-001',
    datasetIds: ['ds-001', 'ds-003', 'ds-006'],
    queryIds: ['query-001'],
    visibility: 'team',
  },
  {
    id: 'proj-002',
    name: createDynamicField('Protein Structure Prediction Benchmark'),
    description: createDynamicField('Benchmarking AlphaFold2 predictions against experimental structures for membrane proteins.'),
    memberIds: ['member-003', 'member-004'],
    status: 'active',
    createdAt: new Date(Date.now() - 2592000000),
    lastActivity: new Date(Date.now() - 86400000),
    leadId: 'member-004',
    datasetIds: ['ds-002', 'ds-004'],
    queryIds: [],
    visibility: 'public',
  },
];

// Initial discussions
const initialDiscussions: DiscussionThread[] = [
  {
    id: 'disc-001',
    title: createDynamicField('TP53 mutation analysis methodology'),
    authorId: 'member-001',
    projectId: 'proj-001',
    tags: ['methodology', 'tp53', 'variant-calling'],
    replyCount: 5,
    createdAt: new Date(Date.now() - 604800000),
    lastReply: new Date(Date.now() - 3600000),
    content: createDynamicField('Team, I\'d like to propose we use GATK HaplotypeCaller for our TP53 variant calling pipeline. The latest v4.4 shows improved sensitivity for indels. Thoughts?'),
    replies: [
      { id: 'reply-001', authorId: 'member-002', content: 'I agree. We should also consider DeepVariant as a comparison baseline.', timestamp: new Date(Date.now() - 500000000), reactions: { '👍': 3, '🎯': 1 } },
      { id: 'reply-002', authorId: 'member-003', content: 'Can I benchmark both on our test dataset? I estimate it would take ~2 days on the GPU cluster.', timestamp: new Date(Date.now() - 400000000), reactions: { '👍': 2, '🚀': 2 } },
    ],
  },
];

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useSciHubStore = create<SciHubStore>()(
  persist(
    (set, get) => ({
      // === INITIAL STATE ===
      
      // Preferences
      preferences: {
        theme: 'system',
        language: 'en',
        fontSize: 'medium',
        resultsPerPage: 20,
        sidebarCollapsed: false,
        autoSaveInterval: 30,
        defaultDataSource: 'crossref',
        notifications: {
          emailJobComplete: true,
          emailNewCollaborator: true,
          pushUpdates: false,
          weeklyDigest: true,
          researchAlerts: true,
        },
        onboardingCompleted: false,
        skillLevel: 'intermediate',
      },

      // User Profile
      userProfile: {
        displayName: createDynamicField('Dr. Researcher'),
        email: createDynamicField('researcher@university.edu'),
        institution: createDynamicField('University of Science'),
        orcid: createDynamicField('0000-0000-0000-0000'),
        bio: createDynamicField('Computational biologist interested in cancer genomics and drug discovery.'),
        role: 'researcher',
        joinDate: new Date(Date.now() - 7776000000), // 90 days ago
        researchInterests: ['cancer-genomics', 'drug-discovery', 'machine-learning'],
        publicationsCount: 12,
        hIndex: 8,
      },

      // Dashboard Stats
      dashboardStats: {
        activeJobs: createDynamicField(2),
        storageUsed: createDynamicField('18.4 MB'),
        storageUsedBytes: createDynamicField(19293798000),
        apiCallsToday: createDynamicField(147),
        collaborators: createDynamicField(4),
        savedItems: createDynamicField(23),
        queriesRun: createDynamicField(89),
        systemHealth: createDynamicField(94),
        streakDays: createDynamicField(7),
      },

      // Activities
      activities: [],

      // Datasets
      datasets: generateSyntheticDatasets(),
      totalStorageUsed: 19293798000,

      // Connectors
      connectors: generateSyntheticConnectors(),

      // Compute Jobs
      computeJobs: generateSyntheticJobs(),
      computeNodes: initialComputeNodes,

      // Workspace
      workspaceFiles: generateSyntheticWorkspaceFiles(),
      activeFileId: 'file-001',

      // Queries
      savedQueries: generateSyntheticQueries(),
      currentQueryResult: null,
      isExecutingQuery: false,

      // Knowledge Graph
      graphNodes: [],
      graphEdges: [],

      // Collaboration
      projects: initialProjects,
      teamMembers: initialTeamMembers,
      discussions: initialDiscussions,

      // AETHEL AI
      aethelModels: initialAethelModels,
      aethelQueries: [],
      activeAethelQuery: null,

      // Workflows
      workflows: [],

      // Notifications
      notifications: generateSyntheticNotifications(),
      guidanceSuggestions: generateSyntheticGuidance(),
      upgradePrompts: [],
      unreadNotificationCount: 2,

      // Search & Saves
      searchHistory: [],
      savedItems: [],

      // Database Config
      databaseConfig: {
        provider: 'IndexedDB',
        enabled: true,
        autoPushThreshold: createDynamicField(100 * 1024 * 1024), // 100MB
        pushInProgress: false,
        syncInterval: 5,
        tables: ['datasets', 'queries', 'jobs', 'workspace'],
      },
      currentVolumeTier: VOLUME_TIERS[1], // Start at tier 2

      // UI State
      sidebarOpen: true,
      sidebarCollapsed: false,
      modals: {},
      loadingStates: {},
      errors: {},

      // ==========================================================================
      // PREFERENCES ACTIONS
      // ==========================================================================

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),

      setLanguage: (lang) =>
        set((state) => ({
          preferences: { ...state.preferences, language: lang },
        })),

      setSkillLevel: (level) =>
        set((state) => ({
          preferences: { ...state.preferences, skillLevel: level },
        })),

      // ==========================================================================
      // PROFILE ACTIONS
      // ==========================================================================

      updateUserProfile: (field, value) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            [field]: typeof value === 'string' 
              ? updateDynamicField(state.userProfile[field] as DynamicField<string>, value)
              : value,
          },
        })),

      resetProfileChanges: () =>
        set((state) => ({
          userProfile: Object.fromEntries(
            Object.entries(state.userProfile).map(([k, v]) => [
              k,
              v && typeof v === 'object' && 'syntheticValue' in v 
                ? { ...(v as DynamicField), value: (v as DynamicField).syntheticValue, isDirty: false }
                : v,
            ])
          ) as UserProfile,
        })),

      // ==========================================================================
      // DASHBOARD ACTIONS
      // ==========================================================================

      updateDashboardStat: (key, value) =>
        set((state) => ({
          dashboardStats: {
            ...state.dashboardStats,
            [key]: updateDynamicField(state.dashboardStats[key] as any, value) as any,
          },
        })),

      addActivity: (activity) =>
        set((state) => ({
          activities: [
            {
              ...activity,
              id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              timestamp: new Date(),
            },
            ...state.activities,
          ].slice(0, 100), // Keep last 100 activities
        })),

      clearActivities: () => set({ activities: [] }),

      // ==========================================================================
      // DATASET ACTIONS (with Storage Layer Integration)
      // ==========================================================================

      addDataset: (dataset) => {
        const newDataset: DatasetItem = {
          ...dataset,
          id: generateId(),
          createdAt: new Date(),
          storageLayer: 'local',
          volumeTier: 1,
        };
        
        set((state) => {
          const newDatasets = [...state.datasets, newDataset];
          const newTotalStorage = state.totalStorageUsed + (dataset.sizeBytes.value || 0);
          
          return {
            datasets: newDatasets,
            totalStorageUsed: newTotalStorage,
            dashboardStats: {
              ...state.dashboardStats,
              storageUsed: updateDynamicField(state.dashboardStats.storageUsed, formatBytes(newTotalStorage)),
              storageUsedBytes: updateDynamicField(state.dashboardStats.storageUsedBytes, newTotalStorage),
            },
          };
        });

        // Check if we need to trigger upgrade prompt
        get().checkVolumeThreshold();
        
        get().addActivity({
          type: 'upload',
          message: createDynamicField(`Added dataset: ${dataset.name.value}`),
          icon: '📁',
        });
      },

      updateDataset: (id, updates) =>
        set((state) => ({
          datasets: state.datasets.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      deleteDataset: (id) =>
        set((state) => {
          const dataset = state.datasets.find((d) => d.id === id);
          const newDatasets = state.datasets.filter((d) => d.id !== id);
          const newTotalStorage = state.totalStorageUsed - (dataset?.sizeBytes.value || 0);
          
          return {
            datasets: newDatasets,
            totalStorageUsed: Math.max(0, newTotalStorage),
            dashboardStats: {
              ...state.dashboardStats,
              storageUsed: updateDynamicField(state.dashboardStats.storageUsed, formatBytes(Math.max(0, newTotalStorage))),
            },
          };
        }),

      toggleFavoriteDataset: (id) =>
        set((state) => ({
          datasets: state.datasets.map((d) =>
            d.id === id
              ? { ...d, isFavorite: updateDynamicField(d.isFavorite, !d.isFavorite.value) }
              : d
          ),
        })),

      startDownload: (id) => {
        set((state) => ({
          datasets: state.datasets.map((d) =>
            d.id === id
              ? { ...d, downloaded: updateDynamicField(d.downloaded, true), downloadProgress: updateDynamicField(d.downloadProgress, 0) }
              : d
          ),
        }));

        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            get().addActivity({
              type: 'download',
              message: createDynamicField(`Downloaded: ${get().datasets.find(d => d.id === id)?.name.value}`),
              icon: '⬇️',
            });
          }
          get().updateDownloadProgress(id, Math.min(progress, 100));
        }, 500);
      },

      updateDownloadProgress: (id, progress) =>
        set((state) => ({
          datasets: state.datasets.map((d) =>
            d.id === id
              ? { ...d, downloadProgress: updateDynamicField(d.downloadProgress, progress) }
              : d
          ),
        })),

      // ==========================================================================
      // CONNECTOR ACTIONS (with Real API Simulation)
      // ==========================================================================

      toggleConnector: async (id) => {
        const connector = get().connectors.find((c) => c.id === id);
        if (!connector) return;

        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? { ...c, syncStatus: 'syncing' as const }
              : c
          ),
        }));

        // Simulate connection delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const newConnectedState = !connector.isConnected.value;
        
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? {
                  ...c,
                  isConnected: updateDynamicField(c.isConnected, newConnectedState),
                  syncStatus: newConnectedState ? 'success' : 'idle',
                  lastSync: newConnectedState ? new Date() : undefined,
                }
              : c
          ),
        }));

        get().addActivity({
          type: newConnectedState ? 'connect' : 'disconnect',
          message: createDynamicField(`${newConnectedState ? 'Connected to' : 'Disconnected from'} ${connector.name}`),
          icon: newConnectedState ? '✅' : '❌',
        });
      },

      updateConnectorApiKey: (id, key) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? { ...c, apiKey: updateDynamicField(c.apiKey, key) }
              : c
          ),
        })),

      syncConnector: async (id) => {
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id ? { ...c, syncStatus: 'syncing' } : c
          ),
        }));

        // Simulate sync with variable latency
        const latency = 500 + Math.random() * 2000;
        await new Promise((resolve) => setTimeout(resolve, latency));

        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? {
                  ...c,
                  syncStatus: 'success',
                  lastSync: new Date(),
                  latency,
                  recordCount: updateDynamicField(
                    c.recordCount,
                    c.recordCount.value + Math.floor(Math.random() * 1000)
                  ),
                }
              : c
          ),
        }));

        get().addActivity({
          type: 'search',
          message: createDynamicField(`Synced ${get().connectors.find((c) => c.id === id)?.name}`),
          icon: '🔄',
        });
      },

      syncAllConnectors: async () => {
        const connected = get().connectors.filter((c) => c.isConnected.value);
        for (const connector of connected) {
          await get().syncConnector(connector.id);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      },

      // ==========================================================================
      // COMPUTE JOB ACTIONS
      // ==========================================================================

      addComputeJob: (job) => {
        const newJob: ComputeJob = {
          ...job,
          id: generateId(),
          startTime: new Date(),
        };
        
        set((state) => ({
          computeJobs: [...state.computeJobs, newJob],
          dashboardStats: {
            ...state.dashboardStats,
            activeJobs: updateDynamicField(
              state.dashboardStats.activeJobs,
              state.dashboardStats.activeJobs.value + 1
            ),
          },
        }));

        get().addActivity({
          type: 'job',
          message: createDynamicField(`Submitted job: ${job.name.value}`),
          icon: '⚙️',
        });
      },

      updateJobProgress: (id, progress) =>
        set((state) => ({
          computeJobs: state.computeJobs.map((j) =>
            j.id === id
              ? { ...j, progress: updateDynamicField(j.progress, progress) }
              : j
          ),
        })),

      cancelJob: (id) =>
        set((state) => {
          const job = state.computeJobs.find((j) => j.id === id);
          return {
            computeJobs: state.computeJobs.map((j) =>
              j.id === id ? { ...j, status: 'cancelled' } : j
            ),
            dashboardStats: job?.status === 'running' || job?.status === 'queued'
              ? {
                  ...state.dashboardStats,
                  activeJobs: updateDynamicField(
                    state.dashboardStats.activeJobs,
                    state.dashboardStats.activeJobs.value - 1
                  ),
                }
              : state.dashboardStats,
          };
        }),

      restartJob: (id) =>
        set((state) => ({
          computeJobs: state.computeJobs.map((j) =>
            j.id === id
              ? {
                  ...j,
                  status: 'queued',
                  progress: updateDynamicField(j.progress, 0),
                  startTime: new Date(),
                  endTime: undefined,
                  errorMessage: undefined,
                }
              : j
          ),
        })),

      // ==========================================================================
      // WORKSPACE ACTIONS (with Code Execution Simulation)
      // ==========================================================================

      addWorkspaceFile: (file) => {
        const newFile: WorkspaceFile = {
          ...file,
          id: generateId(),
          createdAt: new Date(),
          lastModified: new Date(),
        };
        set((state) => ({ workspaceFiles: [...state.workspaceFiles, newFile] }));
      },

      updateFileContent: (id, content) =>
        set((state) => ({
          workspaceFiles: state.workspaceFiles.map((f) =>
            f.id === id
              ? {
                  ...f,
                  content: updateDynamicField(f.content, content),
                  isModified: updateDynamicField(f.isModified, true),
                  lastModified: new Date(),
                }
              : f
          ),
        })),

      setActiveFile: (id) => set({ activeFileId: id }),

      deleteWorkspaceFile: (id) =>
        set((state) => ({
          workspaceFiles: state.workspaceFiles.filter((f) => f.id !== id),
          activeFileId: state.activeFileId === id ? null : state.activeFileId,
        })),

      executeCode: async (id) => {
        const file = get().workspaceFiles.find((f) => f.id === id);
        if (!file) throw new Error('File not found');

        set({ isExecutingQuery: true });

        // Simulate code execution
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

        const isSuccess = Math.random() > 0.2; // 80% success rate
        
        const result: ExecutionResult = {
          output: isSuccess
            ? `# Execution Results\n\n✅ Script executed successfully!\n\n## Output\n\n\`\`\`\nProcessed ${Math.floor(Math.random() * 1000)} records\nFound ${Math.floor(Math.random() * 50)} significant results\nExecution time: ${(Math.random() * 5).toFixed(2)}s\nMemory usage: ${(20 + Math.random() * 80).toFixed(1)} MB\n\`\`\`\n\n## Generated Visualizations\n- Created 2 plots saved to /outputs/\n`
            : '',
          error: isSuccess
            ? undefined
            : 'SyntaxError: Invalid syntax on line 15 (TypeError: cannot unpack non-iterable NoneType object)',
          executionTime: 1000 + Math.random() * 2000,
          memoryUsed: 20 + Math.random() * 80,
          status: isSuccess ? 'success' : 'error',
        };

        set((state) => ({
          workspaceFiles: state.workspaceFiles.map((f) =>
            f.id === id ? { ...f, executionResult: result } : f
          ),
          isExecutingQuery: false,
        }));

        get().addActivity({
          type: 'compute',
          message: createDynamicField(
            `Executed ${file.name.value}: ${result.status}`
          ),
          icon: result.status === 'success' ? '✅' : '❌',
        });

        return result;
      },

      // ==========================================================================
      // QUERY ACTIONS
      // ==========================================================================

      addSavedQuery: (query) =>
        set((state) => ({
          savedQueries: [...state.savedQueries, { ...query, id: generateId() }],
        })),

      updateSavedQuery: (id, updates) =>
        set((state) => ({
          savedQueries: state.savedQueries.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        })),

      deleteSavedQuery: (id) =>
        set((state) => ({
          savedQueries: state.savedQueries.filter((q) => q.id !== id),
        })),

      executeSavedQuery: async (id) => {
        const query = get().savedQueries.find((q) => q.id === id);
        if (!query) return;

        set({ isExecutingQuery: true });

        // Simulate query execution
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500));

        const mockResult: QueryResult = {
          columns: ['id', 'name', 'value', 'category', 'date'],
          rows: Array.from({ length: 20 }, (_, i) => [
            `row-${i}`,
            `Item ${i}`,
            Math.random() * 100,
            ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
            new Date(Date.now() - Math.random() * 86400000 * 30).toISOString().split('T')[0],
          ]),
          executionTime: 500 + Math.random() * 1500,
          rowCount: 20,
          source: 'synthetic',
          truncated: false,
          exportFormats: ['csv', 'json', 'excel', 'parquet'],
        };

        set((state) => ({
          currentQueryResult: mockResult,
          isExecutingQuery: false,
          savedQueries: state.savedQueries.map((q) =>
            q.id === id
              ? {
                  ...q,
                  runCount: updateDynamicField(q.runCount, q.runCount.value + 1),
                  lastRun: new Date(),
                  results: mockResult,
                }
              : q
          ),
          dashboardStats: {
            ...state.dashboardStats,
            queriesRun: updateDynamicField(
              state.dashboardStats.queriesRun,
              state.dashboardStats.queriesRun.value + 1
            ),
          },
        }));

        get().addActivity({
          type: 'query',
          message: createDynamicField(`Ran query: ${query.name.value} (${mockResult.rowCount} rows)`),
          icon: '🔎',
        });
      },

      // ==========================================================================
      // KNOWLEDGE GRAPH ACTIONS
      // ==========================================================================

      addGraphNode: (node) =>
        set((state) => ({
          graphNodes: [...state.graphNodes, { ...node, id: generateId() }],
        })),

      addGraphEdge: (edge) =>
        set((state) => ({ graphEdges: [...state.graphEdges, edge] })),

      clearGraph: () => set({ graphNodes: [], graphEdges: [] }),

      // ==========================================================================
      // COLLABORATION ACTIONS
      // ==========================================================================

      addProject: (project) => {
        const now = new Date();
        set((state) => ({
          projects: [
            ...state.projects,
            { ...project, id: generateId(), createdAt: now, lastActivity: now },
          ],
        }));
      },

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, lastActivity: new Date() } : p
          ),
        })),

      addDiscussion: (discussion) => {
        const now = new Date();
        set((state) => ({
          discussions: [
            ...state.discussions,
            { ...discussion, id: generateId(), createdAt: now, lastReply: now },
          ],
        }));
      },

      addReply: (discussionId, reply) =>
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === discussionId
              ? {
                  ...d,
                  replies: [...d.replies, { ...reply, id: generateId(), timestamp: new Date() }],
                  replyCount: d.replyCount + 1,
                  lastReply: new Date(),
                }
              : d
          ),
        })),

      // ==========================================================================
      // AETHEL AI ACTIONS
      // ==========================================================================

      sendAethelQuery: async (modelId, prompt) => {
        const model = get().aethelModels.find((m) => m.id === modelId);
        if (!model?.available) {
          set((state) => ({
            aethelQueries: [
              ...state.aethelQueries,
              {
                id: generateId(),
                modelId,
                prompt: createDynamicField(prompt),
                response: createDynamicField('Sorry, this model is currently unavailable. Please try another model.'),
                tokensUsed: createDynamicField(0),
                computeTime: createDynamicField(0),
                priority: 'normal',
                budget: createDynamicField(0),
                timestamp: new Date(),
                status: 'failed',
                error: 'Model unavailable',
              },
            ],
          }));
          return;
        }

        const queryId = generateId();
        
        // Add query in processing state
        set((state) => ({
          aethelQueries: [
            {
              id: queryId,
              modelId,
              prompt: createDynamicField(prompt),
              response: createDynamicField(''),
              tokensUsed: createDynamicField(0),
              computeTime: createDynamicField(0),
              priority: 'normal',
              budget: createDynamicField(0),
              timestamp: new Date(),
              status: 'processing',
            },
            ...state.aethelQueries,
          ],
          activeAethelQuery: queryId,
        }));

        // Simulate AI processing time based on model speed
        const processingTime =
          model.speed === 'fast' ? 1000 + Math.random() * 1000 :
          model.speed === 'medium' ? 2000 + Math.random() * 2000 :
          4000 + Math.random() * 4000;

        await new Promise((resolve) => setTimeout(resolve, processingTime));

        // Generate contextual response
        const response = generateAIResponse(prompt, model);

        set((state) => ({
          aethelQueries: state.aethelQueries.map((q) =>
            q.id === queryId
              ? {
                  ...q,
                  response: createDynamicField(response.text),
                  tokensUsed: createDynamicField(response.tokens),
                  computeTime: createDynamicField(processingTime),
                  status: 'completed',
                }
              : q
          ),
          activeAethelQuery: null,
        }));

        get().addActivity({
          type: 'query',
          message: createDynamicField(`AETHEL AI query completed (${model.name})`),
          icon: '🤖',
        });
      },

      clearAethelHistory: () => set({ aethelQueries: [] }),

      // ==========================================================================
      // WORKFLOW ACTIONS
      // ==========================================================================

      addWorkflow: (workflow) =>
        set((state) => ({
          workflows: [...state.workflows, { ...workflow, id: generateId(), createdAt: new Date() }],
        })),

      updateWorkflow: (id, updates) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      runWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, status: 'running', lastRun: new Date() } : w
          ),
        }));

        get().addActivity({
          type: 'compute',
          message: createDynamicField(`Started workflow: ${get().workflows.find(w => w.id === id)?.name.value}`),
          icon: '▶️',
        });
      },

      // ==========================================================================
      // NOTIFICATION ACTIONS
      // ==========================================================================

      markNotificationRead: (id) =>
        set((state) => {
          const newUnread = state.notifications.find((n) => n.id === id && !n.read)
            ? state.unreadNotificationCount - 1
            : state.unreadNotificationCount;
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadNotificationCount: Math.max(0, newUnread),
          };
        }),

      markAllNotificationsRead: () =>
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
          unreadNotificationCount: 0,
        }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            { ...notification, id: generateId(), timestamp: new Date() },
            ...state.notifications,
          ].slice(0, 50),
          unreadNotificationCount:
            state.unreadNotificationCount +
            (notification.priority === 'urgent' || notification.priority === 'high' ? 1 : 0),
        })),

      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      // ==========================================================================
      // GUIDANCE ACTIONS (Progressive Discovery System)
      // ==========================================================================

      showGuidance: (id) =>
        set((state) => ({
          guidanceSuggestions: state.guidanceSuggestions.map((g) =>
            g.id === id
              ? { ...g, shownCount: g.shownCount + 1 }
              : g
          ),
        })),

      dismissGuidance: (id) =>
        set((state) => ({
          guidanceSuggestions: state.guidanceSuggestions.map((g) =>
            g.id === id ? { ...g, dismissed: true } : g
          ),
        })),

      getRelevantGuidance: (context: string) => {
        return get()
          .guidanceSuggestions.filter(
            (g) =>
              (g.context === context || g.context === 'global') &&
              !g.dismissed &&
              g.shownCount < g.maxShows
          )
          .sort((a, b) => b.priority - a.priority);
      },

      // ==========================================================================
      // UPGRADE PROMPT ACTIONS (Call-for-Action System)
      // ==========================================================================

      checkVolumeThreshold: () => {
        const state = get();
        const currentStorage = state.totalStorageUsed;
        
        // Find current tier
        const currentTier = VOLUME_TIERS
          .slice()
          .reverse()
          .find((t) => currentStorage <= t.maxSize) || VOLUME_TIERS[0];
        
        const nextTier = VOLUME_TIERS.find((t) => t.tier === currentTier.tier + 1);
        
        // Check if we're at 80% of current tier capacity
        const threshold = currentTier.maxSize * 0.8;
        const shouldPrompt = currentStorage >= threshold && nextTier;
        
        if (shouldPrompt && nextTier) {
          const existingPrompt = state.upgradePrompts.find(
            (p) => p.type === 'storage' && !p.dismissed
          );
          
          if (!existingPrompt) {
            const newPrompt: UpgradePrompt = {
              id: generateId(),
              type: 'storage',
              title: nextTier.upgradePrompt || 'Consider upgrading your storage',
              message: `You're using ${formatBytes(currentStorage)} of ${formatBytes(currentTier.maxSize)} in your ${currentTier.name} plan.`,
              currentValue: currentStorage,
              limitValue: currentTier.maxSize,
              unit: 'bytes',
              severity: currentStorage >= currentTier.maxSize * 0.95 ? 'critical' : 'warning',
              dismissed: false,
              actionUrl: '/settings',
              actionLabel: 'View Plans',
              alternativeAction: 'Clean up unused data',
              shownAt: new Date(),
            };
            
            set((state) => ({
              upgradePrompts: [...state.upgradePrompts, newPrompt],
              currentVolumeTier: currentTier.tier as any,
            }));
            
            return { shouldPrompt: true, prompt: newPrompt };
          }
        }
        
        set({ currentVolumeTier: currentTier.tier as any });
        return { shouldPrompt: false };
      },

      dismissUpgradePrompt: (id) =>
        set((state) => ({
          upgradePrompts: state.upgradePrompts.map((p) =>
            p.id === id
              ? { ...p, dismissed: true, dismissUntil: new Date(Date.now() + 86400000) }
              : p
          ),
        })),

      triggerUpgradePrompt: (type) => {
        const prompts: Record<UpgradePrompt['type'], Omit<UpgradePrompt, 'id' | 'shownAt'>> = {
          storage: {
            type: 'storage',
            title: '📊 Storage Limit Approaching',
            message: 'Your data is growing! Upgrade for more space.',
            currentValue: get().totalStorageUsed,
            limitValue: get().currentVolumeTier.maxSize,
            unit: 'bytes',
            severity: 'warning',
            dismissed: false,
            actionUrl: '/settings',
            actionLabel: 'Upgrade Now',
            alternativeAction: 'Archive old data',
          },
          compute: {
            type: 'compute',
            title: '⚡ Compute Credits Low',
            message: 'You\'ve used 80% of your monthly compute quota.',
            currentValue: 80,
            limitValue: 100,
            unit: '%',
            severity: 'warning',
            dismissed: false,
            actionUrl: '/compute',
            actionLabel: 'Buy More Credits',
            alternativeAction: 'Optimize your jobs',
          },
          api_rate: {
            type: 'api_rate',
            title: '🔌 API Rate Limit Near',
            message: 'Approaching rate limits for some connectors.',
            currentValue: 85,
            limitValue: 100,
            unit: '%',
            severity: 'info',
            dismissed: false,
            actionUrl: '/connectors',
            actionLabel: 'Manage Connectors',
            alternativeAction: 'Add API keys for higher limits',
          },
          collaboration: {
            type: 'collaboration',
            title: '👥 Team Size Limit',
            message: 'You\'ve reached the maximum team members for your plan.',
            currentValue: 5,
            limitValue: 5,
            unit: 'members',
            severity: 'warning',
            dismissed: false,
            actionUrl: '/collaboration',
            actionLabel: 'Upgrade for More Seats',
            alternativeAction: 'Remove inactive members',
          },
          ai_tokens: {
            type: 'ai_tokens',
            title: '🤖 AI Token Limit',
            message: 'You\'ve used most of your AETHEL AI token allowance.',
            currentValue: 9000,
            limitValue: 10000,
            unit: 'tokens',
            severity: 'info',
            dismissed: false,
            actionUrl: '/aethel',
            actionLabel: 'Get More Tokens',
            alternativeAction: 'Switch to smaller model',
          },
          export_format: {
            type: 'export_format',
            title: '📥 Premium Export Format',
            message: 'Parquet and Excel exports require Pro tier.',
            currentValue: 1,
            limitValue: 0,
            unit: 'exports',
            severity: 'info',
            dismissed: false,
            actionUrl: '/settings',
            actionLabel: 'Upgrade to Pro',
            alternativeAction: 'Use CSV or JSON instead',
          },
          workflow_automation: {
            type: 'workflow_automation',
            title: '🔄 Scheduled Workflows',
            message: 'Automated workflow scheduling is a Pro feature.',
            currentValue: 1,
            limitValue: 0,
            unit: 'workflows',
            severity: 'info',
            dismissed: false,
            actionUrl: '/workspace',
            actionLabel: 'Enable Automation',
            alternativeAction: 'Run workflows manually',
          },
          realtime_collab: {
            type: 'realtime_collab',
            title: '🔄 Real-time Collaboration',
            message: 'Enable real-time editing with your team.',
            currentValue: 1,
            limitValue: 0,
            unit: 'sessions',
            severity: 'info',
            dismissed: false,
            actionUrl: '/collaboration',
            actionLabel: 'Enable Real-time',
            alternativeAction: 'Use share-by-link instead',
          },
        };

        const prompt = prompts[type];
        if (prompt) {
          set((state) => ({
            upgradePrompts: [
              ...state.upgradePrompts.filter((p) => p.type !== type || p.dismissed),
              { ...prompt, id: generateId(), shownAt: new Date() },
            ],
          }));
        }
      },

      // ==========================================================================
      // SEARCH & SAVE ACTIONS
      // ==========================================================================

      addToSearchHistory: (entry) =>
        set((state) => ({
          searchHistory: [
            { ...entry, id: generateId(), timestamp: new Date() },
            ...state.searchHistory,
          ].slice(0, 100),
        })),

      saveItem: (item) =>
        set((state) => ({
          savedItems: [
            { ...item, id: generateId(), savedAt: new Date(), accessCount: 1 },
            ...state.savedItems,
          ].slice(0, 500),
          dashboardStats: {
            ...state.dashboardStats,
            savedItems: updateDynamicField(
              state.dashboardStats.savedItems,
              state.dashboardStats.savedItems.value + 1
            ),
          },
        })),

      unsaveItem: (id) =>
        set((state) => ({
          savedItems: state.savedItems.filter((item) => item.id !== id),
          dashboardStats: {
            ...state.dashboardStats,
            savedItems: updateDynamicField(
              state.dashboardStats.savedItems,
              Math.max(0, state.dashboardStats.savedItems.value - 1)
            ),
          },
        })),

      updateSavedItemNotes: (id, notes) =>
        set((state) => ({
          savedItems: state.savedItems.map((item) =>
            item.id === id ? { ...item, notes } : item
          ),
        })),

      // ==========================================================================
      // UTILITY ACTIONS
      // ==========================================================================

      calculateTotalStorage: () => {
        const state = get();
        const total = state.datasets.reduce((sum, d) => sum + (d.sizeBytes.value || 0), 0);
        set({
          totalStorageUsed: total,
          dashboardStats: {
            ...state.dashboardStats,
            storageUsed: updateDynamicField(state.dashboardStats.storageUsed, formatBytes(total)),
            storageUsedBytes: updateDynamicField(state.dashboardStats.storageUsedBytes, total),
          },
        });
      },

      getCurrentVolumeTier: () => {
        const storage = get().totalStorageUsed;
        return (
          VOLUME_TIERS.slice()
            .reverse()
            .find((t) => storage <= t.maxSize) || VOLUME_TIERS[0]
        );
      },

      exportState: (): string => {
        const state = get();
        const exportable = {
          preferences: state.preferences,
          userProfile: {
            ...state.userProfile,
            displayName: state.userProfile.displayName.value,
            email: state.userProfile.email.value,
            institution: state.userProfile.institution.value,
            bio: state.userProfile.bio.value,
          },
          datasets: state.datasets.map((d) => ({
            ...d,
            name: d.name.value,
            description: d.description.value,
          })),
          savedQueries: state.savedQueries.map((q) => ({
            ...q,
            name: q.name.value,
            sql: q.sql.value,
          })),
          workspaceFiles: state.workspaceFiles.map((f) => ({
            ...f,
            name: f.name.value,
            content: f.content.value,
          })),
          exportDate: new Date().toISOString(),
          version: '1.0.0',
        };
        return JSON.stringify(exportable, null, 2);
      },

      importState: (json: string): boolean => {
        try {
          const imported = JSON.parse(json);
          // Validate basic structure
          if (!imported.preferences || !imported.version) return false;
          
          // Merge imported state (simplified - would need proper migration)
          set({
            preferences: { ...get().preferences, ...imported.preferences },
          });
          
          get().addActivity({
            type: 'upload',
            message: createDynamicField('Imported application state from backup'),
            icon: '📥',
          });
          
          return true;
        } catch {
          return false;
        }
      },

      resetAllFields: () => {
        // Reset all dynamic fields to their synthetic values
        console.log('Resetting all fields to original values');
        get().addActivity({
          type: 'error_recovery',
          message: createDynamicField('Reset all fields to default values'),
          icon: '↩️',
        });
      },

      getDirtyFieldsCount: () => {
        const state = get();
        let count = 0;
        
        // Check profile fields
        Object.values(state.userProfile).forEach((v) => {
          if (v && typeof v === 'object' && 'isDirty' in v && (v as DynamicField).isDirty) count++;
        });
        
        // Check dashboard stats
        Object.values(state.dashboardStats).forEach((v) => {
          if (v && typeof v === 'object' && 'isDirty' in v && (v as DynamicField).isDirty) count++;
        });
        
        return count;
      },

      // ==========================================================================
      // UI ACTIONS
      // ==========================================================================

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
          preferences: {
            ...state.preferences,
            sidebarCollapsed: !state.sidebarCollapsed,
          },
        })),

      setModal: (modalId, open) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: open },
        })),

      setLoading: (key, loading) =>
        set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: loading },
        })),

      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error },
        })),

      clearErrors: () => set({ errors: {} }),
    }),
    {
      name: 'scihub-pro-store',
      partialize: (state) => ({
        // Only persist these fields to localStorage
        preferences: state.preferences,
        userProfile: {
          displayName: state.userProfile.displayName,
          email: state.userProfile.email,
          institution: state.userProfile.institution,
          orcid: state.userProfile.orcid,
          bio: state.userProfile.bio,
        },
        datasets: state.datasets.map(d => ({
          id: d.id,
          name: d.name,
          isFavorite: d.isFavorite,
          downloaded: d.downloaded,
        })),
        savedQueries: state.savedQueries.map(q => ({
          id: q.id,
          name: q.name,
          sql: q.sql,
        })),
        workspaceFiles: state.workspaceFiles.map(f => ({
          id: f.id,
          name: f.name,
          content: f.content,
        })),
        searchHistory: state.searchHistory.slice(0, 50),
        savedItems: state.savedItems.slice(0, 100),
        guidanceSuggestions: state.guidanceSuggestions.map(g => ({
          id: g.id,
          dismissed: g.dismissed,
          shownCount: g.shownCount,
        })),
      }),
      version: 2,
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateAIResponse(prompt: string, model: AethelModel): { text: string; tokens: number } {
  const responses = [
    `Based on your question about "${prompt.substring(0, 50)}...", here's my analysis:\n\n` +
    `The key considerations are:\n` +
    `1. **Methodology**: Current best practices suggest using robust statistical methods with appropriate multiple testing correction.\n` +
    `2. **Data Quality**: Ensure your dataset meets the minimum sample size requirements (n > 30 per group recommended).\n` +
    `3. **Reproducibility**: Document all parameters and consider sharing your analysis workflow.\n\n` +
    `Would you like me to elaborate on any of these points or help you implement specific analyses?`,

    `Great question! Let me break this down:\n\n` +
    `**Understanding the Problem:**\n${prompt.substring(0, 100)}...\n\n` +
    `**Recommended Approach:**\n` +
    `- Start with exploratory data analysis\n` +
    `- Apply appropriate transformations if needed\n` +
    `- Use cross-validation for model selection\n` +
    `- Report confidence intervals alongside point estimates\n\n` +
    `**References to Consider:**\n` +
    `- Recent methodologies in Nature Methods\n` +
    `- Best practices from Bioconductor documentation\n\n` +
    `Shall I provide code examples for any specific step?`,

    `I'd be happy to help with that! Here's what I found:\n\n` +
    `Based on current scientific literature and available databases:\n\n` +
    `📊 **Key Finding**: Recent studies show significant advances in this area.\n` +
    `🔬 **Methodology**: Consider combining multiple evidence sources.\n` +
    `💡 **Tip**: Start with a pilot study before scaling up.\n\n` +
    `---\n\n` +
    `*Response generated by ${model.name} (${model.parameters} parameters)*`,
  ];

  const text = responses[Math.floor(Math.random() * responses.length)];
  const tokens = Math.floor(text.length / 4); // Rough token estimate
  
  return { text, tokens };
}

// Export convenience hooks
export const usePreferences = () => useSciHubStore((s) => s.preferences);
export const useUserProfile = () => useSciHubStore((s) => s.userProfile);
export const useDatasets = () => useSciHubStore((s) => s.datasets);
export const useComputeJobs = () => useSciHubStore((s) => s.computeJobs);
export const useNotifications = () => useSciHubStore((s) => ({
  notifications: s.notifications,
  unreadCount: s.unreadNotificationCount,
}));
