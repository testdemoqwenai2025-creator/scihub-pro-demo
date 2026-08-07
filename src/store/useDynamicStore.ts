/**
 * SciHub Pro - Enhanced Dynamic Store (Zustand)
 * 
 * Full Dynamic Data Pipeline:
 * - Synthetic data pre-fill that clears on user input
 * - Dirty state tracking per field
 * - Volume threshold detection for database push
 * - Free-tier database simulation (DuckDB/Postgres)
 * - Complete CRUD for all entities
 * 
 * Persistence Layers:
 * 1. React State (component level)
 * 2. Zustand Store (global state)
 * 3. localStorage (session persistence via middleware)
 * 4. IndexedDB (large datasets via idbHelper)
 * 5. Free-Tier DB Simulation (when volume threshold reached)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============ COMPREHENSIVE TYPES ============

export interface DynamicField<T = any> {
  value: T;
  syntheticValue: T; // Original synthetic/fake data
  isDirty: boolean; // Has user modified this field?
  lastModified?: Date;
  isValid: boolean;
  validationError?: string;
}

export interface DynamicForm {
  id: string;
  name: string;
  fields: Record<string, DynamicField>;
  isSubmitting: boolean;
  lastSaved?: Date;
  volumeBytes: number; // Track data size for threshold detection
}

export interface DashboardStats {
  activeJobs: DynamicField<number>;
  storageUsed: DynamicField<string>;
  apiCallsToday: DynamicField<number>;
  collaborators: DynamicField<number>;
  systemHealth: DynamicField<number>;
}

export interface ActivityEntry {
  id: string;
  type: 'search' | 'save' | 'export' | 'job' | 'collaboration' | 'login' | 'download' | 'upload' | 'query' | 'compute';
  message: DynamicField<string>;
  timestamp: Date;
  icon: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ConnectorConfig {
  id: string;
  name: string;
  isConnected: DynamicField<boolean>;
  apiKey: DynamicField<string>;
  apiEndpoint: DynamicField<string>;
  lastSync?: Date;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  recordCount?: DynamicField<number>;
  freeTierLimit: number;
  currentUsage: number;
  features: string[];
}

export interface WorkspaceFile {
  id: string;
  name: DynamicField<string>;
  content: DynamicField<string>;
  language: DynamicField<string>;
  createdAt: Date;
  lastModified: Date;
  isModified: boolean;
  sizeBytes: number;
  tabOrder: number;
}

export interface DatasetRecord {
  id: string;
  name: DynamicField<string>;
  description: DynamicField<string>;
  size: DynamicField<string>;
  rows: DynamicField<number>;
  columns: DynamicField<number>;
  type: DynamicField<string>;
  format: DynamicField<string>;
  sourceUrl: DynamicField<string>;
  tags: DynamicField<string[]>;
  lastModified: Date;
  isPublic: DynamicField<boolean>;
  storageLocation: 'local' | 'indexeddb' | 'duckdb' | 'postgres';
  downloadCount: number;
}

export interface QueryHistoryEntry {
  id: string;
  query: DynamicField<string>;
  results: any[];
  executionTime: DynamicField<number>;
  rowsAffected: DynamicField<number>;
  timestamp: Date;
  dataSource: string;
  status: 'success' | 'error' | 'running';
}

export interface ComputeJob {
  id: string;
  name: DynamicField<string>;
  type: DynamicField<'analysis' | 'training' | 'simulation' | 'pipeline' | 'custom'>;
  status: DynamicField<'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'configuring'>;
  priority: DynamicField<'low' | 'normal' | 'high' | 'urgent'>;
  submitter: DynamicField<string>;
  config: JobConfig;
  progress: DynamicField<number>;
  computeHoursUsed: DynamicField<number>;
  computeHoursTotal: DynamicField<number>;
  gpusAllocated: DynamicField<number>;
  memoryUsed: DynamicField<string>;
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  logs: LogEntry[];
  estimatedCost?: DynamicField<number>;
}

export interface JobConfig {
  inputDataset: DynamicField<string>;
  parameters: Record<string, DynamicField<any>>;
  outputFormat: DynamicField<string>;
  notifications: DynamicField<boolean>;
  retryCount: DynamicField<number>;
}

export interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  message: string;
}

export interface CollaborationMember {
  id: string;
  name: DynamicField<string>;
  email: DynamicField<string>;
  role: DynamicField<'pi' | 'postdoc' | 'phd' | 'researcher' | 'data_scientist' | 'developer' | 'admin'>;
  institution: DynamicField<string>;
  orcid: DynamicField<string>;
  avatar?: string;
  isOnline: DynamicField<boolean>;
  joinedAt: Date;
  publications: DynamicField<number>;
}

export interface CollaborationProject {
  id: string;
  name: DynamicField<string>;
  description: DynamicField<string>;
  members: string[]; // Member IDs
  status: DynamicField<'active' | 'paused' | 'completed' | 'archived'>;
  createdAt: Date;
  lastActivity: Date;
  datasets: string[];
  discussions: DiscussionThread[];
}

export interface DiscussionThread {
  id: string;
  title: DynamicField<string>;
  author: string;
  replies: Reply[];
  tags: DynamicField<string[]>;
  createdAt: Date;
  lastReply?: Date;
  isPinned: DynamicField<boolean>;
}

export interface Reply {
  id: string;
  author: string;
  content: DynamicField<string>;
  timestamp: Date;
}

export interface AETHELPrompt {
  id: string;
  prompt: DynamicField<string>;
  model: DynamicField<string>;
  response?: string;
  tokensUsed: DynamicField<number>;
  computeTime: DynamicField<number>;
  priority: DynamicField<'low' | 'normal' | 'high' | 'critical'>;
  computeBudget: DynamicField<number>;
  timestamp: Date;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface KnowledgeGraphNode {
  id: string;
  label: DynamicField<string>;
  type: DynamicField<'concept' | 'paper' | 'author' | 'gene' | 'compound' | 'domain' | 'dataset' | 'method'>;
  properties: Record<string, DynamicField<any>>;
  x: number;
  y: number;
  connections: number;
  createdVia: 'user' | 'import' | 'inference';
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: DynamicField<string>;
  strength: DynamicField<number>;
  evidence?: DynamicField<string>;
  createdBy: string;
}

export interface UserProfileDynamic {
  displayName: DynamicField<string>;
  email: DynamicField<string>;
  institution: DynamicField<string>;
  orcid: DynamicField<string>;
  bio: DynamicField<string>;
  role: DynamicField<'researcher' | 'developer' | 'admin' | 'community'>;
  avatar?: string;
}

export interface NotificationPreference {
  emailJobComplete: DynamicField<boolean>;
  emailCollaborator: DynamicField<boolean>;
  pushUpdates: DynamicField<boolean>;
  weeklyDigest: DynamicField<boolean>;
}

export interface DatabasePushConfig {
  enabled: boolean;
  provider: 'duckdb' | 'postgres' | 'sqlite' | 'mysql';
  connectionString: DynamicField<string>;
  autoPushThreshold: DynamicField<number>; // in bytes
  lastPush?: Date;
  pushHistory: PushRecord[];
}

export interface PushRecord {
  timestamp: Date;
  recordCount: number;
  volumeBytes: number;
  provider: string;
  status: 'success' | 'failed';
  duration: number;
}

// ============ HELPER FUNCTIONS ============

/**
 * Creates a dynamic field with synthetic default value
 * Note: Defined locally to avoid circular dependencies with useSciHubStore
 */
function createDynamicFieldImpl<T>(syntheticValue: T): DynamicField<T> {
  return {
    value: syntheticValue,
    syntheticValue,
    isDirty: false,
    isValid: true,
  };
}

// Export using Object.defineProperty to avoid redeclaration issues
export const createDynamicField = createDynamicFieldImpl;

/**
 * Updates a dynamic field's value and marks as dirty if different from synthetic
 */
export function updateDynamicField<T>(field: DynamicField<T>, newValue: T): DynamicField<T> {
  const isDirty = JSON.stringify(newValue) !== JSON.stringify(field.syntheticValue);
  return {
    ...field,
    value: newValue,
    isDirty,
    lastModified: new Date(),
    isValid: true,
  };
}

/**
 * Calculates approximate byte size of data
 */
function calculateDataSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}

// ============ STORE INTERFACE ============

interface SciHubDynamicStore {
  // Dashboard
  dashboardStats: DashboardStats;
  activities: ActivityEntry[];
  updateDashboardStat: (key: keyof DashboardStats, value: number | string) => void;
  addActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;

  // Connectors
  connectors: ConnectorConfig[];
  toggleConnector: (id: string) => Promise<void>;
  updateConnectorApiKey: (id: string, key: string) => void;
  syncConnector: (id: string) => Promise<void>;

  // Workspace
  workspaceFiles: WorkspaceFile[];
  createFile: (name: string, language: string, content: string) => void;
  updateFileContent: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  reorderFiles: (fileIds: string[]) => void;

  // Data Lake
  datasets: DatasetRecord[];
  createDataset: (dataset: Omit<DatasetRecord, 'id' | 'lastModified' | 'downloadCount'>) => void;
  updateDataset: (id: string, updates: Partial<DatasetRecord>) => void;
  deleteDataset: (id: string) => void;
  getTotalStorage: () => number;

  // Query Executor
  queryHistory: QueryHistoryEntry[];
  addQueryToHistory: (query: string, results: any[], executionTime: number, dataSource: string) => void;
  clearQueryHistory: () => void;

  // Compute Layer
  computeJobs: ComputeJob[];
  createJob: (job: Omit<ComputeJob, 'id' | 'submittedAt' | 'logs' | 'progress' | 'status'>) => void;
  updateJobProgress: (id: string, progress: number) => void;
  cancelJob: (id: string) => void;
  getActiveJobs: () => ComputeJob[];

  // Collaboration
  members: CollaborationMember[];
  projects: CollaborationProject[];
  addMember: (member: Omit<CollaborationMember, 'id' | 'joinedAt'>) => void;
  updateMember: (id: string, updates: Partial<CollaborationMember>) => void;
  removeMember: (id: string) => void;
  createProject: (project: Omit<CollaborationProject, 'id' | 'createdAt' | 'lastActivity' | 'discussions'>) => void;
  addDiscussion: (projectId: string, discussion: Omit<DiscussionThread, 'id' | 'createdAt' | 'replies'>) => void;

  // AETHEL AI
  aethelPrompts: AETHELPrompt[];
  submitPrompt: (prompt: AETHELPrompt) => void;
  clearPromptHistory: () => void;

  // Knowledge Graph
  graphNodes: KnowledgeGraphNode[];
  graphEdges: KnowledgeGraphEdge[];
  addNode: (node: Omit<KnowledgeGraphNode, 'id' | 'connections' | 'createdVia'>) => void;
  addEdge: (edge: Omit<KnowledgeGraphEdge, 'id' | 'createdBy'>) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;

  // User Profile
  userProfile: UserProfileDynamic;
  updateUserProfile: (key: keyof UserProfileDynamic, value: any) => void;
  resetUserProfile: () => void;

  // Notifications
  notificationPrefs: NotificationPreference;
  updateNotificationPref: (key: keyof NotificationPreference, value: boolean) => void;

  // Database/Persistence
  dbConfig: DatabasePushConfig;
  updateDbConfig: (key: keyof DatabasePushConfig, value: any) => void;
  checkVolumeThreshold: () => { exceeded: boolean; totalSize: number; shouldPush: boolean };
  simulatePushToDatabase: () => Promise<PushRecord>;

  // Utility
  getDirtyFieldsCount: () => number;
  resetAllFields: () => void;
  exportState: () => string;
  importState: (json: string) => void;
}

// ============ SYNTHETIC DATA GENERATORS ============

const generateSyntheticDashboardStats = (): DashboardStats => ({
  activeJobs: createDynamicField(12),
  storageUsed: createDynamicField('2.4 GB'),
  apiCallsToday: createDynamicField(1247),
  collaborators: createDynamicField(8),
  systemHealth: createDynamicField(98),
});

const generateSyntheticConnectors = (): ConnectorConfig[] => [
  {
    id: 'ncbi-genbank',
    name: 'NCBI GenBank',
    isConnected: createDynamicField(false),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://eutils.ncbi.nlm.nih.gov/entrez/eutils'),
    freeTierLimit: 3, // requests/second
    currentUsage: 0,
    features: ['BLAST Search', 'Sequence Download', 'Taxonomy Browser'],
    recordCount: createDynamicField(250000000),
  },
  {
    id: 'rcsb-pdb',
    name: 'RCSB PDB',
    isConnected: createDynamicField(true),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://data.rcsb.org/rest/v1'),
    freeTierLimit: 10,
    currentUsage: 0,
    features: ['3D Viewer', 'Structure Search', 'Ligand Analysis'],
    recordCount: createDynamicField(200000),
    lastSync: new Date(Date.now() - 3600000),
  },
  {
    id: 'uniprot',
    name: 'UniProt',
    isConnected: createDynamicField(true),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://rest.uniprot.org'),
    freeTierLimit: 15,
    currentUsage: 0,
    features: ['ID Mapping', 'Batch Retrieval', 'BLAST'],
    recordCount: createDynamicField(230000000),
  },
  {
    id: 'pubchem',
    name: 'PubChem',
    isConnected: createDynamicField(true),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://pubchem.ncbi.nlm.nih.gov/rest/pug'),
    freeTierLimit: 5,
    currentUsage: 0,
    features: ['PUG REST API', 'Structure Search', 'Biological Testing'],
    recordCount: createDynamicField(111000000),
  },
  {
    id: 'crossref',
    name: 'CrossRef',
    isConnected: createDynamicField(true),
    apiKey: createDynamicField(''), // Free tier - no key needed
    apiEndpoint: createDynamicField('https://api.crossref.org/works'),
    freeTierLimit: 50,
    currentUsage: 0,
    features: ['DOI Resolution', 'Citation Network', 'Metadata Query'],
    recordCount: createDynamicField(140000000),
  },
  {
    id: 'openalex',
    name: 'OpenAlex',
    isConnected: createDynamicField(false),
    apiKey: createDynamicField(''), // Optional for higher limits
    apiEndpoint: createDynamicField('https://api.openalex.org'),
    freeTierLimit: 10,
    currentUsage: 0,
    features: ['Author Profiles', 'Institution Analytics', 'Topic Modeling'],
    recordCount: createDynamicField(250000000),
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    isConnected: createDynamicField(true),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('http://export.arxiv.org/api/query'),
    freeTierLimit: 0, // Unknown limit
    currentUsage: 0,
    features: ['Category Browse', 'API Access', 'Full Text PDF'],
    recordCount: createDynamicField(2400000),
  },
  {
    id: 'chembl',
    name: 'ChEMBL',
    isConnected: createDynamicField(false),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://www.ebi.ac.uk/chembl/api/data'),
    freeTierLimit: 5,
    currentUsage: 0,
    features: ['Activity Search', 'Target Profile', 'Similarity'],
    recordCount: createDynamicField(2400000),
  },
  {
    id: 'geo',
    name: 'NCBI GEO',
    isConnected: createDynamicField(false),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi'),
    freeTierLimit: 3,
    currentUsage: 0,
    features: ['GEO2R Analysis', 'Dataset Browser', 'Series Matrix'],
    recordCount: createDynamicField(4000000),
  },
  {
    id: 'zenodo',
    name: 'Zenodo',
    isConnected: createDynamicField(false),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://zenodo.org/api'),
    freeTierLimit: 10,
    currentUsage: 0,
    features: ['DOI Minting', 'GitHub Integration', 'Version Control'],
    recordCount: createDynamicField(3000000),
  },
  {
    id: 'figshare',
    name: 'Figshare',
    isConnected: createDynamicField(false),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://api.figshare.com/v2'),
    freeTierLimit: 10,
    currentUsage: 0,
    features: ['File Hosting', 'DOI Assignment', 'Embedding'],
    recordCount: createDynamicField(1500000),
  },
  {
    id: 'kaggle',
    name: 'Kaggle Datasets',
    isConnected: createDynamicField(false),
    apiKey: createDynamicField(''),
    apiEndpoint: createDynamicField('https://www.kaggle.com/api/v1'),
    freeTierLimit: 100, // Daily calls
    currentUsage: 0,
    features: ['Kernels', 'Competitions', 'Discussion Forums'],
    recordCount: createDynamicField(50000),
  },
];

const generateSyntheticWorkspaceFiles = (): WorkspaceFile[] => [
  {
    id: 'file-001',
    name: createDynamicField('analysis.py'),
    content: createDynamicField(`# SciHub Pro - Python Analysis Example
# Bioinformatics: Sequence Analysis

from Bio import SeqIO
import pandas as pd
import matplotlib.pyplot as plt

# Load sequence data (simulated)
def load_genomic_data(accession: str):
    """Load sequence from NCBI GenBank"""
    print(f"Loading sequence: {accession}")
    sequence = "ATGCGATCGATCGTACGATCGATCGTAGCTAGCTAGC"
    return {
        'accession': accession,
        'sequence': sequence,
        'length': len(sequence),
        'gc_content': calculate_gc_content(sequence)
    }

def calculate_gc_content(sequence: str) -> float:
    """Calculate GC content of DNA sequence"""
    gc_count = sequence.upper().count('G') + sequence.upper().count('C')
    return (gc_count / len(sequence)) * 100 if sequence else 0

# Main analysis pipeline
if __name__ == "__main__":
    brca1_data = load_genomic_data("NM_001301717.2")
    print(f"GC Content: {brca1_data['gc_content']:.2f}%")`),
    language: createDynamicField('python'),
    createdAt: new Date(Date.now() - 86400000),
    lastModified: new Date(Date.now() - 3600000),
    isModified: false,
    sizeBytes: 4892,
    tabOrder: 0,
  },
  {
    id: 'file-002',
    name: createDynamicField('query.sql'),
    content: createDynamicField(`-- Find highly cited papers in bioinformatics
SELECT 
    p.title,
    p.authors,
    p.year,
    p.citations,
    p.journal
FROM publications p
WHERE p.field = 'Bioinformatics'
    AND p.year >= 2020
ORDER BY p.citations DESC
LIMIT 20;`),
    language: createDynamicField('sql'),
    createdAt: new Date(Date.now() - 172800000),
    lastModified: new Date(Date.now() - 7200000),
    isModified: false,
    sizeBytes: 1256,
    tabOrder: 1,
  },
];

const generateSyntheticDatasets = (): DatasetRecord[] => [
  {
    id: 'ds-001',
    name: createDynamicField('TCGA Expression Matrix'),
    description: createDynamicField('RNA-seq gene expression data from The Cancer Genome Atlas across 33 cancer types'),
    size: createDynamicField('4.2 GB'),
    rows: createDynamicField(24500000),
    columns: createDynamicField(25000),
    type: createDynamicField('Gene Expression'),
    format: createDynamicField('Parquet'),
    sourceUrl: createDynamicField('https://portal.gdc.cancer.gov/'),
    tags: createDynamicField(['cancer', 'genomics', 'expression', 'tcga']),
    lastModified: new Date(Date.now() - 604800000),
    isPublic: createDynamicField(true),
    storageLocation: 'indexeddb',
    downloadCount: 1247,
  },
  {
    id: 'ds-002',
    name: createDynamicField('Human Protein Atlas'),
    description: createDynamicField('Tissue-specific protein expression profiles for all human proteins'),
    size: createDynamicField('1.8 GB'),
    rows: createDynamicField(15000000),
    columns: createDynamicField(180),
    type: createDynamicField('Proteomics'),
    format: createDynamicField('HDF5'),
    sourceUrl: createDynamicField('https://www.proteinatlas.org/'),
    tags: createDynamicField(['protein', 'tissue', 'expression', 'human']),
    lastModified: new Date(Date.now() - 2592000000),
    isPublic: createDynamicField(true),
    storageLocation: 'local',
    downloadCount: 3421,
  },
  {
    id: 'ds-003',
    name: createDynamicField('ChEMBL Bioactivity'),
    description: createDynamicField('Compound bioactivity data with target binding affinities and drug-like properties'),
    size: createDynamicField('890 MB'),
    rows: createDynamicField(2400000),
    columns: createDynamicField(45),
    type: createDynamicField('Chemical Biology'),
    format: createDynamicField('CSV'),
    sourceUrl: createDynamicField('https://www.ebi.ac.uk/chembl/'),
    tags: createDynamicField(['drug', 'bioactivity', 'compound', 'target']),
    lastModified: new Date(Date.now() - 7776000000),
    isPublic: createDynamicField(true),
    storageLocation: 'duckdb',
    downloadCount: 8932,
  },
  {
    id: 'ds-004',
    name: createDynamicField('PDB Structures'),
    description: createDynamicField('3D coordinates and metadata for experimentally determined protein structures'),
    size: createDynamicField('15 GB'),
    rows: createDynamicField(200000),
    columns: createDynamicField(95),
    type: createDynamicField('Structural Biology'),
    format: createDynamicField('mmCIF'),
    sourceUrl: createDynamicField('https://www.rcsb.org/'),
    tags: createDynamicField(['structure', 'protein', '3d', 'experimental']),
    lastModified: new Date(Date.now() - 2592000),
    isPublic: createDynamicField(true),
    storageLocation: 'postgres',
    downloadCount: 15678,
  },
  {
    id: 'ds-005',
    name: createDynamicField('gnomAD Variants'),
    description: createDynamicField('Genome aggregation database containing allele frequencies from large-scale sequencing'),
    size: createDynamicField('12 GB'),
    rows: createDynamicField(350000000),
    columns: createDynamicField(30),
    type: createDynamicField('Genomics'),
    format: createDynamicField('VCF/BCF'),
    sourceUrl: createDynamicField('https://gnomad.broadinstitute.org/'),
    tags: createDynamicField(['variants', 'population', 'frequency', 'genome']),
    lastModified: new Date(Date.now() - 31536000000),
    isPublic: createDynamicField(true),
    storageLocation: 'duckdb',
    downloadCount: 24567,
  },
  {
    id: 'ds-006',
    name: createDynamicField('arXiv ML Papers'),
    description: createDynamicField('Machine learning paper metadata and abstracts from arXiv preprint server'),
    size: createDynamicField('450 MB'),
    rows: createDynamicField(85000),
    columns: createDynamicField(25),
    type: createDynamicField('Literature'),
    format: createDynamicField('JSON'),
    sourceUrl: createDynamicField('https://arxiv.org/list/cs.LG/recent'),
    tags: createDynamicField(['machine-learning', 'papers', 'preprints', 'cs']),
    lastModified: new Date(Date.now() - 86400000),
    isPublic: createDynamicField(true),
    storageLocation: 'local',
    downloadCount: 5678,
  },
];

const generateSyntheticMembers = (): CollaborationMember[] => [
  {
    id: 'mem-001',
    name: createDynamicField('Dr. Sarah Chen'),
    email: createDynamicField('s.chen@research.edu'),
    role: createDynamicField('pi'),
    institution: createDynamicField('MIT Broad Institute'),
    orcid: createDynamicField('0000-0001-2345-6789'),
    isOnline: createDynamicField(true),
    joinedAt: new Date(Date.now() - 31536000000),
    publications: createDynamicField(47),
  },
  {
    id: 'mem-002',
    name: createDynamicField('Dr. James Wilson'),
    email: createDynamicField('j.wilson@lab.edu'),
    role: createDynamicField('postdoc'),
    institution: createDynamicField('Stanford University'),
    orcid: createDynamicField('0000-0002-3456-7890'),
    isOnline: createDynamicField(true),
    joinedAt: new Date(Date.now() - 15768000000),
    publications: createDynamicField(23),
  },
  {
    id: 'mem-003',
    name: createDynamicField('Emily Rodriguez'),
    email: createDynamicField('e.rodriguez@grad.edu'),
    role: createDynamicField('phd'),
    institution: createDynamicField('UC Berkeley'),
    orcid: createDynamicField('0000-0003-4567-8901'),
    isOnline: createDynamicField(false),
    joinedAt: new Date(Date.now() - 63072000000),
    publications: createDynamicField(8),
  },
  {
    id: 'mem-004',
    name: createDynamicField('Michael Kim'),
    email: createDynamicField('m.kim@data.io'),
    role: createDynamicField('data_scientist'),
    institution: createDynamicField('Google Research'),
    orcid: createDynamicField('0000-0004-5678-9012'),
    isOnline: createDynamicField(true),
    joinedAt: new Date(Date.now() - 94608000000),
    publications: createDynamicField(15),
  },
  {
    id: 'mem-005',
    name: createDynamicField('Dr. Anna Patel'),
    email: createDynamicField('a.patel@pharma.com'),
    role: createDynamicField('researcher'),
    institution: createDynamicField('Pfizer R&D'),
    orcid: createDynamicField('0000-0005-6789-0123'),
    isOnline: createDynamicField(false),
    joinedAt: new Date(Date.now() - 47304000000),
    publications: createDynamicField(31),
  },
];

const generateSyntheticProjects = (): CollaborationProject[] => [
  {
    id: 'proj-001',
    name: createDynamicField('Cancer Genomics Study'),
    description: createDynamicField('Multi-omics integration for identifying novel cancer biomarkers using TCGA and GTEx data'),
    members: ['mem-001', 'mem-002', 'mem-003'],
    status: createDynamicField('active'),
    createdAt: new Date(Date.now() - 15768000000),
    lastActivity: new Date(Date.now() - 3600000),
    datasets: ['ds-001', 'ds-002', 'ds-005'],
    discussions: [],
  },
  {
    id: 'proj-002',
    name: createDynamicField('Drug Discovery Pipeline'),
    description: createDynamicField('Virtual screening and molecular docking for EGFR inhibitor development'),
    members: ['mem-001', 'mem-004', 'mem-005'],
    status: createDynamicField('active'),
    createdAt: new Date(Date.now() - 94608000000),
    lastActivity: new Date(Date.now() - 86400000),
    datasets: ['ds-003'],
    discussions: [],
  },
  {
    id: 'proj-003',
    name: createDynamicField('Protein Structure Prediction'),
    description: createDynamicField('Benchmarking AlphaFold predictions against experimental structures'),
    members: ['mem-002', 'mem-003'],
    status: createDynamicField('paused'),
    createdAt: new Date(Date.now() - 63072000000),
    lastActivity: new Date(Date.now() - 2592000000),
    datasets: ['ds-004'],
    discussions: [],
  },
  {
    id: 'proj-004',
    name: createDynamicField('ML Literature Review'),
    description: createDynamicField('Systematic review of machine learning applications in biomedical research'),
    members: ['mem-004'],
    status: createDynamicField('active'),
    createdAt: new Date(Date.now() - 31536000000),
    lastActivity: new Date(Date.now() - 172800000),
    datasets: ['ds-006'],
    discussions: [],
  },
];

// ============ STORE CREATION ============

export const useDynamicStore = create<SciHubDynamicStore>()(
  persist(
    (set, get) => ({
      // ========== DASHBOARD ==========
      dashboardStats: generateSyntheticDashboardStats(),
      activities: [
        { id: 'act-1', type: 'search', message: createDynamicField('Searched for "CRISPR gene editing" in PubMed'), timestamp: new Date(Date.now() - 300000), icon: '🔍' },
        { id: 'act-2', type: 'save', message: createDynamicField('Saved paper "Advances in Protein Folding" to favorites'), timestamp: new Date(Date.now() - 900000), icon: '⭐' },
        { id: 'act-3', type: 'job', message: createDynamicField('Variant calling pipeline completed successfully'), timestamp: new Date(Date.now() - 1800000), icon: '⚙️' },
        { id: 'act-4', type: 'collaboration', message: createDynamicField('Dr. Smith joined project "Cancer Genomics Study"'), timestamp: new Date(Date.now() - 2700000), icon: '👥' },
        { id: 'act-5', type: 'export', message: createDynamicField('Exported dataset "TCGA Expression Matrix" as CSV'), timestamp: new Date(Date.now() - 3600000), icon: '📤' },
      ],

      updateDashboardStat: (key, value) => set((state) => ({
        dashboardStats: {
          ...state.dashboardStats,
          [key]: updateDynamicField(state.dashboardStats[key], value),
        },
      })),

      addActivity: (activity) => set((state) => ({
        activities: [
          { ...activity, id: `act-${Date.now()}`, timestamp: new Date() },
          ...state.activities.slice(0, 49), // Keep last 50
        ],
      })),

      clearActivities: () => set({ activities: [] }),

      // ========== CONNECTORS ==========
      connectors: generateSyntheticConnectors(),

      toggleConnector: async (id) => {
        const connector = get().connectors.find((c) => c.id === id);
        if (!connector) return;

        const newConnectedState = !connector.isConnected.value;

        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? { ...c, isConnected: updateDynamicField(c.isConnected, newConnectedState), syncStatus: 'syncing' as const }
              : c
          ),
        }));

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? {
                  ...c,
                  isConnected: updateDynamicField(c.isConnected, newConnectedState),
                  syncStatus: newConnectedState ? ('success' as const) : ('idle' as const),
                  lastSync: newConnectedState ? new Date() : undefined,
                }
              : c
          ),
        }));

        get().addActivity({
          type: newConnectedState ? 'save' : 'download',
          message: createDynamicField(`${newConnectedState ? 'Connected to' : 'Disconnected from'} ${connector.name}`),
          icon: newConnectedState ? '✅' : '❌',
        });
      },

      updateConnectorApiKey: (id, key) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id ? { ...c, apiKey: updateDynamicField(c.apiKey, key) } : c
          ),
        })),

      syncConnector: async (id) => {
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id ? { ...c, syncStatus: 'syncing' as const } : c
          ),
        }));

        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));

        const connector = get().connectors.find((c) => c.id === id);
        const newRecordCount = connector?.recordCount?.value
          ? Math.floor(connector.recordCount.value * (1 + (Math.random() - 0.5) * 0.01))
          : 0;

        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? {
                  ...c,
                  syncStatus: 'success' as const,
                  lastSync: new Date(),
                  recordCount: updateDynamicField(c.recordCount || createDynamicField(0), newRecordCount),
                }
              : c
          ),
        }));
      },

      // ========== WORKSPACE ==========
      workspaceFiles: generateSyntheticWorkspaceFiles(),

      createFile: (name, language, content) => {
        const newFile: WorkspaceFile = {
          id: `file-${Date.now()}`,
          name: createDynamicField(name),
          content: createDynamicField(content),
          language: createDynamicField(language),
          createdAt: new Date(),
          lastModified: new Date(),
          isModified: true,
          sizeBytes: calculateDataSize(content),
          tabOrder: get().workspaceFiles.length,
        };

        set((state) => ({
          workspaceFiles: [...state.workspaceFiles, newFile],
        }));

        get().addActivity({
          type: 'save',
          message: createDynamicField(`Created file "${name}"`),
          icon: '📄',
        });
      },

      updateFileContent: (id, content) =>
        set((state) => ({
          workspaceFiles: state.workspaceFiles.map((f) =>
            f.id === id
              ? {
                  ...f,
                  content: updateDynamicField(f.content, content),
                  lastModified: new Date(),
                  isModified: true,
                  sizeBytes: calculateDataSize(content),
                }
              : f
          ),
        })),

      deleteFile: (id) => {
        const file = get().workspaceFiles.find((f) => f.id === id);
        set((state) => ({
          workspaceFiles: state.workspaceFiles.filter((f) => f.id !== id),
        }));
        if (file) {
          get().addActivity({
            type: 'download',
            message: createDynamicField(`Deleted file "${file.name.value}"`),
            icon: '🗑️',
          });
        }
      },

      reorderFiles: (fileIds) =>
        set((state) => ({
          workspaceFiles: state.workspaceFiles
            .map((f) => ({ ...f, tabOrder: fileIds.indexOf(f.id) }))
            .sort((a, b) => a.tabOrder - b.tabOrder),
        })),

      // ========== DATA LAKE ==========
      datasets: generateSyntheticDatasets(),

      createDataset: (dataset) => {
        const newDataset: DatasetRecord = {
          ...dataset,
          id: `ds-${Date.now()}`,
          lastModified: new Date(),
          downloadCount: 0,
        };

        set((state) => ({
          datasets: [...state.datasets, newDataset],
        }));

        get().addActivity({
          type: 'upload',
          message: createDynamicField(`Uploaded dataset "${dataset.name.value}"`),
          icon: '📊',
        });
      },

      updateDataset: (id, updates) =>
        set((state) => ({
          datasets: state.datasets.map((d) =>
            d.id === id ? { ...d, ...updates, lastModified: new Date() } : d
          ),
        })),

      deleteDataset: (id) => {
        const dataset = get().datasets.find((d) => d.id === id);
        set((state) => ({
          datasets: state.datasets.filter((d) => d.id !== id),
        }));
        if (dataset) {
          get().addActivity({
            type: 'download',
            message: createDynamicField(`Deleted dataset "${dataset.name.value}"`),
            icon: '🗑️',
          });
        }
      },

      getTotalStorage: () => {
        const { datasets } = get();
        return datasets.reduce((total, ds) => {
          // Parse size string like "1.5 MB" to bytes (approximate)
          const sizeStr = ds.size.value || '0';
          const match = sizeStr.match(/([\d.]+)\s*(KB|MB|GB|TB)?/i);
          if (match) {
            const num = parseFloat(match[1]);
            const unit = (match[2] || 'B').toUpperCase();
            const multiplier = unit === 'KB' ? 1024 : unit === 'MB' ? 1048576 : unit === 'GB' ? 1073741824 : unit === 'TB' ? 1099511627776 : 1;
            return total + (num * multiplier);
          }
          return total;
        }, 0);
      },

      // ========== QUERY EXECUTOR ==========
      queryHistory: [],

      addQueryToHistory: (query, results, executionTime, dataSource) => {
        const entry: QueryHistoryEntry = {
          id: `query-${Date.now()}`,
          query: createDynamicField(query),
          results,
          executionTime: createDynamicField(executionTime),
          rowsAffected: createDynamicField(results.length),
          timestamp: new Date(),
          dataSource,
          status: 'success',
        };

        set((state) => ({
          queryHistory: [entry, ...state.queryHistory.slice(0, 99)],
        }));

        get().addActivity({
          type: 'query',
          message: createDynamicField(`Executed query on ${dataSource} (${results.length} rows)`),
          icon: '🔎',
        });
      },

      clearQueryHistory: () => set({ queryHistory: [] }),

      // ========== COMPUTE LAYER ==========
      computeJobs: [],

      createJob: (job) => {
        const newJob: ComputeJob = {
          ...job,
          id: `job-${Date.now()}`,
          submittedAt: new Date(),
          logs: [{ timestamp: new Date(), level: 'INFO', message: 'Job submitted to queue' }],
          progress: createDynamicField(0),
          status: createDynamicField('queued'),
        };

        set((state) => ({
          computeJobs: [...state.computeJobs, newJob],
        }));

        get().addActivity({
          type: 'job',
          message: createDynamicField(`Submitted job "${job.name.value}"`),
          icon: '⚡',
        });
      },

      updateJobProgress: (id, progress) =>
        set((state) => ({
          computeJobs: state.computeJobs.map((j) =>
            j.id === id
              ? {
                  ...j,
                  progress: updateDynamicField(j.progress, progress),
                  ...(progress >= 100
                    ? { status: updateDynamicField(j.status, 'completed'), completedAt: new Date() }
                    : {}),
                }
              : j
          ),
        })),

      cancelJob: (id) =>
        set((state) => ({
          computeJobs: state.computeJobs.map((j) =>
            j.id === id
              ? {
                  ...j,
                  status: updateDynamicField(j.status, 'cancelled'),
                  logs: [...j.logs, { timestamp: new Date(), level: 'WARN', message: 'Job cancelled by user' }],
                }
              : j
          ),
        })),

      getActiveJobs: () => get().computeJobs.filter((j) => j.status.value === 'running'),

      // ========== COLLABORATION ==========
      members: generateSyntheticMembers(),
      projects: generateSyntheticProjects(),

      addMember: (member) => {
        const newMember: CollaborationMember = {
          ...member,
          id: `mem-${Date.now()}`,
          joinedAt: new Date(),
        };

        set((state) => ({
          members: [...state.members, newMember],
        }));

        get().addActivity({
          type: 'collaboration',
          message: createDynamicField(`${member.name.value} joined the team`),
          icon: '👋',
        });
      },

      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      removeMember: (id) => {
        const member = get().members.find((m) => m.id === id);
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
        if (member) {
          get().addActivity({
            type: 'collaboration',
            message: createDynamicField(`${member.name.value} left the team`),
            icon: '👋',
          });
        }
      },

      createProject: (project) => {
        const newProject: CollaborationProject = {
          ...project,
          id: `proj-${Date.now()}`,
          createdAt: new Date(),
          lastActivity: new Date(),
          discussions: [],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },

      addDiscussion: (projectId, discussion) => {
        const newThread: DiscussionThread = {
          ...discussion,
          id: `disc-${Date.now()}`,
          createdAt: new Date(),
          replies: [],
        };

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, discussions: [...p.discussions, newThread], lastActivity: new Date() }
              : p
          ),
        }));
      },

      // ========== AETHEL AI ==========
      aethelPrompts: [],

      submitPrompt: (prompt) => {
        const newPrompt: AETHELPrompt = {
          ...prompt,
          id: `prompt-${Date.now()}`,
          status: 'queued',
        };

        set((state) => ({
          aethelPrompts: [newPrompt, ...state.aethelPrompts.slice(0, 19)],
        }));

        get().addActivity({
          type: 'compute',
          message: createDynamicField(`Submitted prompt to ${prompt.model.value}`),
          icon: '🤖',
        });
      },

      clearPromptHistory: () => set({ aethelPrompts: [] }),

      // ========== KNOWLEDGE GRAPH ==========
      graphNodes: [],
      graphEdges: [],

      addNode: (node) => {
        const newNode: KnowledgeGraphNode = {
          ...node,
          id: `node-${Date.now()}`,
          connections: 0,
          createdVia: 'user',
        };

        set((state) => ({
          graphNodes: [...state.graphNodes, newNode],
        }));
      },

      addEdge: (edge) => {
        const newEdge: KnowledgeGraphEdge = {
          ...edge,
          id: `edge-${Date.now()}`,
          createdBy: 'user',
        };

        set((state) => ({
          graphEdges: [...state.graphEdges, newEdge],
          graphNodes: state.graphNodes.map((n) =>
            n.id === edge.source || n.id === edge.target
              ? { ...n, connections: n.connections + 1 }
              : n
          ),
        }));
      },

      removeNode: (id) =>
        set((state) => ({
          graphNodes: state.graphNodes.filter((n) => n.id !== id),
          graphEdges: state.graphEdges.filter((e) => e.source !== id && e.target !== id),
        })),

      removeEdge: (id) =>
        set((state) => ({
          graphEdges: state.graphEdges.filter((e) => e.id !== id),
        })),

      // ========== USER PROFILE ==========
      userProfile: {
        displayName: createDynamicField('Dr. Researcher Name'),
        email: createDynamicField('researcher@institution.edu'),
        institution: createDynamicField('Leading Research Institution'),
        orcid: createDynamicField('0000-0001-2345-6789'),
        bio: createDynamicField('Computational biologist specializing in genomics and machine learning applications in biomedical research.'),
        role: createDynamicField('researcher'),
      },

      updateUserProfile: (key, value) =>
        set((state) => {
          const profile = state.userProfile as Record<string, any>;
          return {
            userProfile: {
              ...state.userProfile,
              [key]: updateDynamicField(profile[key] || createDynamicField(''), value),
            },
          };
        }),

      resetUserProfile: () =>
        set({
          userProfile: {
            displayName: createDynamicField('Dr. Researcher Name'),
            email: createDynamicField('researcher@institution.edu'),
            institution: createDynamicField('Leading Research Institution'),
            orcid: createDynamicField('0000-0001-2345-6789'),
            bio: createDynamicField('Computational biologist specializing in genomics and machine learning.'),
            role: createDynamicField('researcher'),
          },
        }),

      // ========== NOTIFICATIONS ==========
      notificationPrefs: {
        emailJobComplete: createDynamicField(true),
        emailCollaborator: createDynamicField(true),
        pushUpdates: createDynamicField(false),
        weeklyDigest: createDynamicField(true),
      },

      updateNotificationPref: (key, value) =>
        set((state) => ({
          notificationPrefs: {
            ...state.notificationPrefs,
            [key]: updateDynamicField(state.notificationPrefs[key], value),
          },
        })),

      // ========== DATABASE CONFIGURATION ==========
      dbConfig: {
        enabled: false,
        provider: 'duckdb',
        connectionString: createDynamicField('memory:scihub_pro.db'),
        autoPushThreshold: createDynamicField(50 * 1024 * 1024), // 50MB default
        pushHistory: [],
      },

      updateDbConfig: (key, value) =>
        set((state) => ({
          dbConfig: { ...state.dbConfig, [key]: value },
        })),

      checkVolumeThreshold: () => {
        const state = get();
        const totalSize =
          calculateDataSize(state.datasets) +
          calculateDataSize(state.workspaceFiles) +
          calculateDataSize(state.queryHistory);

        return {
          exceeded: totalSize > state.dbConfig.autoPushThreshold.value,
          totalSize,
          shouldPush: totalSize > state.dbConfig.autoPushThreshold.value * 0.8,
        };
      },

      simulatePushToDatabase: async () => {
        const startTime = Date.now();

        set((state) => ({
          dbConfig: {
            ...state.dbConfig,
            pushHistory: [
              ...state.dbConfig.pushHistory,
              {
                timestamp: new Date(),
                recordCount:
                  state.datasets.length +
                  state.workspaceFiles.length +
                  state.queryHistory.length,
                volumeBytes: calculateDataSize(state.datasets) + calculateDataSize(state.workspaceFiles),
                provider: state.dbConfig.provider,
                status: 'success' as const,
                duration: 0,
              },
            ],
          },
        }));

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));

        const duration = Date.now() - startTime;

        set((state) => ({
          dbConfig: {
            ...state.dbConfig,
            lastPush: new Date(),
            pushHistory: state.dbConfig.pushHistory.map((record, index) =>
              index === state.dbConfig.pushHistory.length - 1
                ? { ...record, duration }
                : record
            ),
          },
        }));

        get().addActivity({
          type: 'export',
          message: createDynamicField(
            `Pushed data to ${get().dbConfig.provider} (${(duration / 1000).toFixed(1)}s)`
          ),
          icon: '💾',
        });

        return get().dbConfig.pushHistory[get().dbConfig.pushHistory.length - 1];
      },

      // ========== UTILITY FUNCTIONS ==========
      getDirtyFieldsCount: () => {
        const state = get();
        let count = 0;

        // Count dirty fields in user profile
        Object.values(state.userProfile).forEach((field) => {
          if ((field as DynamicField).isDirty) count++;
        });

        // Count dirty fields in connectors
        state.connectors.forEach((conn) => {
          Object.values(conn).forEach((val) => {
            if (val && typeof val === 'object' && 'isDirty' in val && (val as DynamicField).isDirty) count++;
          });
        });

        return count;
      },

      resetAllFields: () => {
        set({
          dashboardStats: generateSyntheticDashboardStats(),
          userProfile: {
            displayName: createDynamicField('Dr. Researcher Name'),
            email: createDynamicField('researcher@institution.edu'),
            institution: createDynamicField('Leading Research Institution'),
            orcid: createDynamicField('0000-0001-2345-6789'),
            bio: createDynamicField('Computational biologist specializing in genomics.'),
            role: createDynamicField('researcher'),
          },
        });
      },

      exportState: () => {
        const state = get();
        return JSON.stringify(
          {
            userProfile: state.userProfile,
            connectors: state.connectors,
            datasets: state.datasets,
            workspaceFiles: state.workspaceFiles,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        );
      },

      importState: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.userProfile) set({ userProfile: data.userProfile });
          if (data.connectors) set({ connectors: data.connectors });
          if (data.datasets) set({ datasets: data.datasets });
          if (data.workspaceFiles) set({ workspaceFiles: data.workspaceFiles });
        } catch (error) {
          console.error('Failed to import state:', error);
        }
      },
    }),
    {
      name: 'scihub-dynamic-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        connectors: state.connectors,
        datasets: state.datasets,
        workspaceFiles: state.workspaceFiles,
        notificationPrefs: state.notificationPrefs,
        dbConfig: state.dbConfig,
        activities: state.activities.slice(0, 20),
        queryHistory: state.queryHistory.slice(0, 20),
      }),
    }
  )
);

// Note: Helper functions (createDynamicField, updateDynamicField, resetDynamicField) are exported where defined above
// No additional exports needed here to avoid redeclaration errors
// export { calculateDataSize }; // Internal use only
