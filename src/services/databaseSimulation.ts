/**
 * SciHub Pro - Free-Tier Database Simulation Layer
 * 
 * Provides simulated database functionality for:
 * - DuckDB: In-process analytical SQL queries (free, embedded)
 * - PostgreSQL: Structured data storage (free tier via Supabase/Neon)
 * - SQLite: Local persistent storage (fully free)
 * 
 * This layer activates when:
 * 1. Data volume exceeds localStorage limits (>5MB)
 * 2. User explicitly requests database push
 * 3. Complex queries require SQL execution
 * 
 * Free Tier Limits (Real):
 * - DuckDB: Unlimited, in-process, no server needed
 * - Supabase (PostgreSQL): 500MB storage, 50K monthly active users
 * - Neon (PostgreSQL): 0.5GB storage, 1 compute hour/day
 * - PlanetScale (MySQL): 5GB storage, 1B row reads/month
 */

// ============ TYPES ============

export interface DatabaseProvider {
  id: string;
  name: string;
  type: 'analytical' | 'relational' | 'keyvalue' | 'document';
  freeTierLimits: FreeTierLimit;
  connectionConfig: ConnectionConfig;
  status: 'available' | 'configuring' | 'connected' | 'error';
}

export interface FreeTierLimit {
  storageMB: number;
  maxRows: number;
  concurrentConnections: number;
  apiCallsPerMonth: number;
  features: string[];
  limitations: string[];
}

export interface ConnectionConfig {
  endpoint?: string;
  apiKey?: string;
  databaseName: string;
  connectionString: string;
  poolSize: number;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowsAffected: number;
  queryPlan?: QueryPlanStep[];
  fromCache: boolean;
  provider: string;
}

export interface QueryPlanStep {
  step: number;
  operation: string;
  table?: string;
  estimatedRows?: number;
  actualRows?: number;
  timeMs: number;
}

export interface TableSchema {
  name: string;
  columns: ColumnDef[];
  rowCount: number;
  sizeBytes: number;
  indexes: IndexDef[];
}

export interface ColumnDef {
  name: string;
  type: 'integer' | 'float' | 'text' | 'boolean' | 'date' | 'json' | 'array';
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: any;
}

export interface IndexDef {
  name: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gist' | 'gin';
  unique: boolean;
}

export interface BulkImportResult {
  success: boolean;
  rowsImported: number;
  errors: ImportError[];
  durationMs: number;
  tableName: string;
}

export interface ImportError {
  row: number;
  column: string;
  value: any;
  error: string;
}

// ============ DATABASE PROVIDER DEFINITIONS ============

export const DATABASE_PROVIDERS: Record<string, DatabaseProvider> = {
  duckdb: {
    id: 'duckdb',
    name: 'DuckDB Embedded',
    type: 'analytical',
    status: 'available',
    freeTierLimits: {
      storageMB: Infinity, // Limited by disk space
      maxRows: Infinity,
      concurrentConnections: 1,
      apiCallsPerMonth: Infinity,
      features: [
        'Columnar storage',
        'Parallel query execution',
        'SQL compliant',
        'Direct Parquet/CSV reading',
        'Window functions',
        'JSON support',
      ],
      limitations: [
        'Single-writer concurrency',
        'No server mode (embedded only)',
        'In-memory or local file only',
      ],
    },
    connectionConfig: {
      databaseName: 'scihub_analytics.db',
      connectionString: ':memory:',
      poolSize: 1,
    },
  },
  postgresql_supabase: {
    id: 'postgresql_supabase',
    name: 'Supabase (PostgreSQL)',
    type: 'relational',
    status: 'available',
    freeTierLimits: {
      storageMB: 500,
      maxRows: 10000000,
      concurrentConnections: 60,
      apiCallsPerMonth: 50000000,
      features: [
        'Full PostgreSQL feature set',
        'Real-time subscriptions',
        'Row Level Security',
        'Database backups',
        'REST API auto-generated',
        'Auth integration',
        'Edge Functions',
      ],
      limitations: [
        '500MB database size',
        'Rate limiting on API',
        'Shared infrastructure',
        'No dedicated IP',
      ],
    },
    connectionConfig: {
      endpoint: 'https://your-project.supabase.co',
      databaseName: 'postgres',
      connectionString: 'postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres',
      poolSize: 10,
    },
  },
  postgresql_neon: {
    id: 'postgresql_neon',
    name: 'Neon Serverless Postgres',
    type: 'relational',
    status: 'available',
    freeTierLimits: {
      storageMB: 512,
      maxRows: 5000000,
      concurrentConnections: 50,
      apiCallsPerMonth: 10000000,
      features: [
        'Serverless scaling',
        'Branching (like Git)',
        'Auto-suspend/resume',
        'PgBouncer connection pooling',
        'Full PostgreSQL compatibility',
      ],
      limitations: [
        '0.5GB storage',
        '1 compute hour/day',
        'Cold start on resume',
        'No custom extensions',
      ],
    },
    connectionConfig: {
      endpoint: 'ep-xxx.us-east-2.aws.neon.tech',
      databaseName: 'neondb',
      connectionString: 'postgresql://[user]:[password]@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require',
      poolSize: 10,
    },
  },
  sqlite: {
    id: 'sqlite',
    name: 'SQLite (Local)',
    type: 'relational',
    status: 'available',
    freeTierLimits: {
      storageMB: Infinity,
      maxRows: 18446744073709551615, // Theoretical limit
      concurrentConnections: 1,
      apiCallsPerMonth: Infinity,
      features: [
        'Zero configuration',
        'Cross-platform',
        'ACID compliant',
        'Full-text search',
        'JSON extension',
        'WASM support (browser)',
      ],
      limitations: [
        'Single writer',
        'No built-in networking',
        'Limited ALTER TABLE support',
      ],
    },
    connectionConfig: {
      databaseName: 'scihub_local.db',
      connectionString: 'file:./scihub_local.db?mode=memory&cache=shared',
      poolSize: 1,
    },
  },
};

// ============ MOCK TABLE SCHEMAS ============

const MOCK_SCHEMAS: TableSchema[] = [
  {
    name: 'publications',
    columns: [
      { name: 'id', type: 'integer', nullable: false, primaryKey: true },
      { name: 'doi', type: 'text', nullable: false, primaryKey: false },
      { name: 'title', type: 'text', nullable: false, primaryKey: false },
      { name: 'authors', type: 'json', nullable: true, primaryKey: false },
      { name: 'abstract', type: 'text', nullable: true, primaryKey: false },
      { name: 'year', type: 'integer', nullable: true, primaryKey: false },
      { name: 'journal', type: 'text', nullable: true, primaryKey: false },
      { name: 'citations', type: 'integer', nullable: true, primaryKey: false },
      { name: 'field', type: 'text', nullable: true, primaryKey: false },
      { name: 'source', type: 'text', nullable: true, primaryKey: false },
      { name: 'created_at', type: 'date', nullable: true, primaryKey: false },
    ],
    rowCount: 2450000,
    sizeBytes: 892000000,
    indexes: [
      { name: 'idx_publications_doi', columns: ['doi'], type: 'btree', unique: true },
      { name: 'idx_publications_year', columns: ['year'], type: 'btree', unique: false },
      { name: 'idx_publications_citations', columns: ['citations'], type: 'btree', unique: false },
      { name: 'idx_publications_field', columns: ['field'], type: 'hash', unique: false },
    ],
  },
  {
    name: 'genomic_sequences',
    columns: [
      { name: 'id', type: 'integer', nullable: false, primaryKey: true },
      { name: 'accession', type: 'text', nullable: false, primaryKey: false },
      { name: 'organism', type: 'text', nullable: false, primaryKey: false },
      { name: 'gene_name', type: 'text', nullable: true, primaryKey: false },
      { name: 'sequence', type: 'text', nullable: true, primaryKey: false },
      { name: 'sequence_length', type: 'integer', nullable: true, primaryKey: false },
      { name: 'gc_content', type: 'float', nullable: true, primaryKey: false },
      { name: 'chromosome', type: 'text', nullable: true, primaryKey: false },
      { name: 'start_position', type: 'integer', nullable: true, primaryKey: false },
      { name: 'end_position', type: 'integer', nullable: true, primaryKey: false },
      { name: 'type', type: 'text', nullable: true, primaryKey: false },
    ],
    rowCount: 350000000,
    sizeBytes: 12000000000,
    indexes: [
      { name: 'idx_genomic_accession', columns: ['accession'], type: 'btree', unique: true },
      { name: 'idx_genomic_organism', columns: ['organism'], type: 'btree', unique: false },
      { name: 'idx_genomic_gene', columns: ['gene_name'], type: 'btree', unique: false },
    ],
  },
  {
    name: 'molecular_compounds',
    columns: [
      { name: 'id', type: 'integer', nullable: false, primaryKey: true },
      { name: 'name', type: 'text', nullable: false, primaryKey: false },
      { name: 'smiles', type: 'text', nullable: false, primaryKey: false },
      { name: 'molecular_weight', type: 'float', nullable: true, primaryKey: false },
      { name: 'formula', type: 'text', nullable: true, primaryKey: false },
      { name: 'iupac_name', type: 'text', nullable: true, primaryKey: false },
      { name: 'inchi', type: 'text', nullable: true, primaryKey: false },
      { name: 'inchi_key', type: 'text', nullable: true, primaryKey: false },
      { name: 'num_rotatable_bonds', type: 'integer', nullable: true, primaryKey: false },
      { name: 'logp', type: 'float', nullable: true, primaryKey: false },
      { name: 'created_at', type: 'date', nullable: true, primaryKey: false },
    ],
    rowCount: 111000000,
    sizeBytes: 45000000000,
    indexes: [
      { name: 'idx_compounds_smiles', columns: ['smiles'], type: 'hash', unique: true },
      { name: 'idx_compounds_inchikey', columns: ['inchi_key'], type: 'btree', unique: true },
      { name: 'idx_compounds_mw', columns: ['molecular_weight'], type: 'btree', unique: false },
    ],
  },
  {
    name: 'bioactivity_data',
    columns: [
      { name: 'id', type: 'integer', nullable: false, primaryKey: true },
      { name: 'compound_id', type: 'integer', nullable: false, primaryKey: false },
      { name: 'target_protein', type: 'text', nullable: false, primaryKey: false },
      { name: 'activity_type', type: 'text', nullable: true, primaryKey: false },
      { name: 'ic50_nm', type: 'float', nullable: true, primaryKey: false },
      { name: 'ki_nm', type: 'float', nullable: true, primaryKey: false },
      { name: 'ec50_nm', type: 'float', nullable: true, primaryKey: false },
      { name: 'assay_organism', type: 'text', nullable: true, primaryKey: false },
      { name: 'assay_type', type: 'text', nullable: true, primaryKey: false },
      { name: 'publication_doi', type: 'text', nullable: true, primaryKey: false },
    ],
    rowCount: 2400000,
    sizeBytes: 890000000,
    indexes: [
      { name: 'idx_bioact_compound', columns: ['compound_id'], type: 'btree', unique: false },
      { name: 'idx_bioact_target', columns: ['target_protein'], type: 'btree', unique: false },
      { name: 'idx_bioact_ic50', columns: ['ic50_nm'], type: 'btree', unique: false },
    ],
  },
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'integer', nullable: false, primaryKey: true },
      { name: 'email', type: 'text', nullable: false, primaryKey: false },
      { name: 'display_name', type: 'text', nullable: true, primaryKey: false },
      { name: 'institution', type: 'text', nullable: true, primaryKey: false },
      { name: 'orcid', type: 'text', nullable: true, primaryKey: false },
      { name: 'role', type: 'text', nullable: true, primaryKey: false },
      { name: 'is_active', type: 'boolean', nullable: true, primaryKey: false, defaultValue: true },
      { name: 'last_login', type: 'date', nullable: true, primaryKey: false },
      { name: 'created_at', type: 'date', nullable: true, primaryKey: false },
    ],
    rowCount: 15420,
    sizeBytes: 4500000,
    indexes: [
      { name: 'idx_users_email', columns: ['email'], type: 'btree', unique: true },
      { name: 'idx_users_orcid', columns: ['orcid'], type: 'btree', unique: true },
    ],
  },
];

// ============ QUERY SIMULATION ENGINE ============

/**
 * Simulates SQL query execution with realistic timing and results
 */
export async function executeSimulatedQuery(
  sql: string,
  provider: string = 'duckdb'
): Promise<QueryResult> {
  const startTime = Date.now();

  // Parse the query to determine what to return
  const sqlUpper = sql.toUpperCase().trim();
  
  // Determine query complexity and simulate appropriate delay
  let baseDelay = 50; // Base delay in ms
  
  if (sqlUpper.includes('JOIN')) baseDelay += 100;
  if (sqlUpper.includes('GROUP BY')) baseDelay += 80;
  if (sqlUpper.includes('ORDER BY')) baseDelay += 30;
  if (sqlUpper.includes('WHERE')) baseDelay += 50;
  if (sqlUpper.includes('COUNT(*)') || sqlUpper.includes('SUM(') || sqlUpper.includes('AVG(')) baseDelay += 40;
  if (sqlUpper.includes('WINDOW') || sqlUpper.includes('OVER(')) baseDelay += 150;

  // Add randomness
  baseDelay += Math.random() * baseDelay * 0.5;

  // Simulate network delay for remote providers
  if (provider !== 'duckdb' && provider !== 'sqlite') {
    baseDelay += 20 + Math.random() * 80;
  }

  await new Promise((resolve) => setTimeout(resolve, baseDelay));

  const executionTime = Date.now() - startTime;

  // Generate mock results based on query pattern
  return generateMockResults(sql, executionTime, provider);
}

function generateMockResults(sql: string, executionTime: number, provider: string): QueryResult {
  const sqlUpper = sql.toUpperCase();

  // Detect target table
  let tableName = 'publications';
  if (sqlUpper.includes('GENOMIC') || sqlUpper.includes('SEQUENCE')) tableName = 'genomic_sequences';
  else if (sqlUpper.includes('COMPOUND') || sqlUpper.includes('MOLECULAR')) tableName = 'molecular_compounds';
  else if (sqlUpper.includes('BIOACTIVITY') || sqlUpper.includes('IC50')) tableName = 'bioactivity_data';

  // Get schema for the table
  const schema = MOCK_SCHEMAS.find((s) => s.name === tableName) || MOCK_SCHEMAS[0];

  // Determine which columns are selected
  const selectedColumns = detectSelectedColumns(sql, schema);
  
  // Generate rows based on LIMIT clause or default
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  const limit = limitMatch ? parseInt(limitMatch[1]) : 20;

  // Generate mock rows
  const rows = generateMockRows(selectedColumns, Math.min(limit, 100), tableName);

  // Generate query plan
  const queryPlan = generateQueryPlan(sql, schema);

  return {
    columns: selectedColumns.map((c) => c.name),
    rows,
    executionTimeMs: executionTime,
    rowsAffected: rows.length,
    queryPlan,
    fromCache: Math.random() > 0.7, // 30% cache hit rate simulation
    provider,
  };
}

function detectSelectedColumns(sql: string, schema: TableSchema): ColumnDef[] {
  // Check for SELECT *
  if (/\*\s*FROM/i.test(sql)) {
    return schema.columns.filter(c => !c.name.toLowerCase().includes('sequence')); // Exclude large text fields
  }

  // Try to extract specific columns
  const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/i);
  if (selectMatch) {
    const columns = selectMatch[1].split(',').map((c) => c.trim().split(/\s+|\.|\(/)[0]);
    
    return columns
      .map((colName) => schema.columns.find((c) => c.name === colName))
      .filter(Boolean) as ColumnDef[];
  }

  // Default: return first few columns
  return schema.columns.slice(0, 6);
}

function generateMockRows(columns: ColumnDef[], count: number, tableName: string): Record<string, any>[] {
  const rows: Record<string, any>[] = [];

  for (let i = 0; i < count; i++) {
    const row: Record<string, any> = {};

    columns.forEach((col) => {
      switch (col.type) {
        case 'integer':
          row[col.name] = Math.floor(Math.random() * 100000);
          break;
        case 'float':
          row[col.name] = parseFloat((Math.random() * 1000).toFixed(3));
          break;
        case 'text':
          row[col.name] = generateMockTextValue(col.name, tableName, i);
          break;
        case 'boolean':
          row[col.name] = Math.random() > 0.5;
          break;
        case 'date':
          row[col.name] = new Date(Date.now() - Math.random() * 31536000000).toISOString().split('T')[0];
          break;
        case 'json':
          row[col.name] = JSON.stringify(generateMockJson(col.name));
          break;
        default:
          row[col.name] = `value_${i}`;
      }
    });

    rows.push(row);
  }

  return rows;
}

function generateMockTextValue(columnName: string, tableName: string, index: number): string {
  const titles = [
    'Advances in Machine Learning for Drug Discovery',
    'Quantum Computing Applications in Molecular Simulation',
    'CRISPR-Cas9 Gene Editing: Recent Developments',
    'Deep Learning for Protein Structure Prediction',
    'Climate Change Impact on Biodiversity Patterns',
    'Novel Materials for Sustainable Energy Storage',
    'Single-Cell RNA Sequencing Analysis Methods',
    'Graph Neural Networks for Chemical Property Prediction',
    'Federated Learning in Healthcare Data Analysis',
    'Exoplanet Detection Using Deep Learning Methods',
  ];

  const authors = [
    'Smith J, Johnson A, Williams M',
    'Brown K, Davis R, Miller S',
    'Wilson T, Moore C, Taylor L',
    'Anderson P, Thomas J, Jackson E',
    'White R, Harris D, Martin S',
  ];

  const journals = [
    'Nature', 'Science', 'Cell', 'PNAS', 'Nature Methods',
    'Bioinformatics', 'J Chem Inf Model', 'Phys Rev Lett',
  ];

  switch (columnName.toLowerCase()) {
    case 'title':
      return titles[index % titles.length];
    case 'authors':
      return authors[index % authors.length];
    case 'journal':
      return journals[index % journals.length];
    case 'doi':
      return `10.5555/${20240000 + index}`;
    case 'accession':
      return `NM_${String(1301700 + index).padStart(4, '0')}.${index % 10}`;
    case 'organism':
      return index % 2 === 0 ? 'Homo sapiens' : 'Mus musculus';
    case 'gene_name':
      return ['BRCA1', 'TP53', 'EGFR', 'MYC', 'APOE'][index % 5];
    case 'name':
      return ['Aspirin', 'Caffeine', 'Ibuprofen', 'Acetaminophen', 'Metformin'][index % 5];
    case 'smiles':
      return ['CC(=O)Oc1ccccc1C(=O)O', 'Cn1cnc2c1c(=O)n(c(=O)n2C)C'][index % 2];
    case 'target_protein':
      return ['EGFR Kinase', 'COX-2', 'ACE2', 'BRPF1', 'HDAC1'][index % 5];
    case 'field':
      return ['Bioinformatics', 'Genomics', 'Chemistry', 'Physics', 'CS'][index % 5];
    case 'email':
      return `researcher${index + 1}@institution.edu`;
    case 'display_name':
      return [`Dr. Researcher ${String.fromCharCode(65 + index)}`][0];
    case 'institution':
      return ['MIT', 'Stanford', 'Harvard', 'Caltech', 'Berkeley'][index % 5];
    default:
      return `${columnName}_${index}`;
  }
}

function generateMockJson(columnName: string): any {
  if (columnName.toLowerCase().includes('author')) {
    return [{ given: 'John', family: 'Smith' }, { given: 'Jane', family: 'Doe' }];
  }
  return {};
}

function generateQueryPlan(sql: string, schema: TableSchema): QueryPlanStep[] {
  const plan: QueryPlanStep[] = [];
  const sqlUpper = sql.toUpperCase();
  let stepNum = 1;
  let cumulativeTime = 0;

  // Sequential Scan
  const scanTime = 5 + Math.random() * 15;
  plan.push({
    step: stepNum++,
    operation: 'Sequential Scan',
    table: schema.name,
    estimatedRows: schema.rowCount,
    actualRows: Math.floor(schema.rowCount * (0.01 + Math.random() * 0.1)),
    timeMs: scanTime,
  });
  cumulativeTime += scanTime;

  // Filter (WHERE clause)
  if (sqlUpper.includes('WHERE')) {
    const filterTime = 2 + Math.random() * 8;
    plan.push({
      step: stepNum++,
      operation: 'Filter',
      estimatedRows: Math.floor(schema.rowCount * 0.05),
      actualRows: Math.floor(schema.rowCount * 0.02),
      timeMs: filterTime,
    });
    cumulativeTime += filterTime;
  }

  // Aggregate (GROUP BY)
  if (sqlUpper.includes('GROUP BY')) {
    const aggTime = 3 + Math.random() * 10;
    plan.push({
      step: stepNum++,
      operation: 'Aggregate',
      estimatedRows: Math.floor(schema.rowCount * 0.001),
      actualRows: Math.floor(schema.rowCount * 0.0005),
      timeMs: aggTime,
    });
    cumulativeTime += aggTime;
  }

  // Sort (ORDER BY)
  if (sqlUpper.includes('ORDER BY')) {
    const sortTime = 1 + Math.random() * 5;
    plan.push({
      step: stepNum++,
      operation: 'Sort',
      estimatedRows: 100,
      actualRows: 50,
      timeMs: sortTime,
    });
    cumulativeTime += sortTime;
  }

  // Limit
  if (sqlUpper.includes('LIMIT')) {
    plan.push({
      step: stepNum++,
      operation: 'Limit',
      estimatedRows: 20,
      actualRows: 20,
      timeMs: 0.5,
    });
  }

  return plan;
}

// ============ BULK OPERATIONS ============

/**
 * Simulates bulk data import into a table
 */
export async function simulateBulkImport(
  data: Record<string, any>[],
  tableName: string,
  provider: string = 'duckdb'
): Promise<BulkImportResult> {
  const startTime = Date.now();

  // Validate data against schema
  const schema = MOCK_SCHEMAS.find((s) => s.name === tableName);
  const errors: ImportError[] = [];

  if (schema) {
    data.forEach((row, rowIndex) => {
      schema.columns.forEach((col) => {
        if (!col.nullable && (row[col.name] === undefined || row[col.name] === null)) {
          errors.push({
            row: rowIndex,
            column: col.name,
            value: null,
            error: `NOT NULL constraint violated`,
          });
        }
      });
    });
  }

  // Simulate processing delay based on data size
  const processingTime = Math.min(data.length * 0.5 + Math.random() * 500, 3000);
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  return {
    success: errors.length === 0,
    rowsImported: data.length - errors.length,
    errors,
    durationMs: Date.now() - startTime,
    tableName,
  };
}

// ============ DATABASE HEALTH CHECK ============

export interface DatabaseHealthStatus {
  provider: string;
  isHealthy: boolean;
  latencyMs: number;
  connectionsActive: number;
  storageUsedMB: number;
  storageTotalMB: number;
  lastBackup?: Date;
  tables: { name: string; rows: number }[];
}

/**
 * Checks health of all configured database providers
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus[]> {
  const results: DatabaseHealthStatus[] = [];

  for (const [providerId, provider] of Object.entries(DATABASE_PROVIDERS)) {
    const startTime = Date.now();

    try {
      // Simulate health check with variable latency
      const latency = providerId === 'duckdb' ? 2 + Math.random() * 5 :
                      providerId === 'sqlite' ? 1 + Math.random() * 3 :
                      20 + Math.random() * 100;

      await new Promise((resolve) => setTimeout(resolve, latency));

      results.push({
        provider: provider.name,
        isHealthy: Math.random() > 0.05, // 95% uptime simulation
        latencyMs: Date.now() - startTime,
        connectionsActive: Math.floor(Math.random() * provider.freeTierLimits.concurrentConnections * 0.3),
        storageUsedMB: Math.floor(provider.freeTierLimits.storageMB * (0.3 + Math.random() * 0.5)),
        storageTotalMB: provider.freeTierLimits.storageMB,
        lastBackup: new Date(Date.now() - Math.random() * 86400000),
        tables: MOCK_SCHEMAS.map(s => ({ name: s.name, rows: s.rowCount })),
      });
    } catch {
      results.push({
        provider: provider.name,
        isHealthy: false,
        latencyMs: Date.now() - startTime,
        connectionsActive: 0,
        storageUsedMB: 0,
        storageTotalMB: provider.freeTierLimits.storageMB,
        tables: [],
      });
    }
  }

  return results;
}

// ============ EXPORT UTILITIES ============

/**
 * Converts query result to CSV format
 */
export function resultToCSV(result: QueryResult): string {
  const header = result.columns.join(',');
  const rows = result.rows.map(row =>
    result.columns.map(col => {
      const value = row[col];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value ?? '');
    }).join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Converts query result to JSON format
 */
export function resultToJSON(result: QueryResult): string {
  return JSON.stringify(result.rows, null, 2);
}

// ============ EXPORT MOCK SCHEMAS FOR UI ============

export { MOCK_SCHEMAS };

// ============ FREE TIER INFO ============

export function getFreeTierInfo(providerId: string): DatabaseProvider | undefined {
  return DATABASE_PROVIDERS[providerId];
}

export function getAllProviders(): DatabaseProvider[] {
  return Object.values(DATABASE_PROVIDERS);
}

export function getRecommendedProvider(dataSizeMB: number, useCase: 'analytics' | 'transactional'): DatabaseProvider {
  if (useCase === 'analytics') {
    // For analytics, always recommend DuckDB first
    return DATABASE_PROVIDERS.duckdb;
  }

  // For transactional, recommend based on size
  if (dataSizeMB < 512) {
    return DATABASE_PROVIDERS.postgresql_neon;
  } else if (dataSizeMB < 1024) {
    return DATABASE_PROVIDERS.postgresql_supabase;
  }

  return DATABASE_PROVIDERS.sqlite;
}
