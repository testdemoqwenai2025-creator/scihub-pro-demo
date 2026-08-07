'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============ TYPES ============

interface QueryResult {
  columns: string[];
  rows: Record<string, string | number>[];
}

interface ExecutionPlan {
  step: number;
  operation: string;
  table: string;
  cost: number;
  rows: number;
}

// ============ MOCK TABLES ============

const mockTables = [
  { name: 'publications', columns: ['id', 'title', 'authors', 'year', 'doi', 'citations', 'field'], rowCount: 2500000 },
  { name: 'genomic_sequences', columns: ['id', 'organism', 'gene_name', 'sequence_length', 'gc_content', 'chromosome'], rowCount: 300000000 },
  { name: 'molecular_compounds', columns: ['id', 'name', 'smiles', 'molecular_weight', 'logp', 'hba', 'hbd'], rowCount: 111000000 },
  { name: 'bioactivity_data', columns: ['id', 'compound_id', 'target', 'activity_type', 'ic50_nm', 'assay_type'], rowCount: 2400000 },
];

const sampleQueries = [
  {
    name: 'Top Cited Papers',
    sql: `SELECT title, authors, year, citations, journal
FROM publications
WHERE field = 'Bioinformatics'
ORDER BY citations DESC
LIMIT 20;`,
  },
  {
    name: 'High GC Content Genes',
    sql: `SELECT gene_name, organism, sequence_length, gc_content, chromosome
FROM genomic_sequences
WHERE gc_content > 60 AND organism = 'Homo sapiens'
ORDER BY gc_content DESC
LIMIT 100;`,
  },
  {
    name: 'Active Compounds',
    sql: `SELECT c.name AS compound, c.molecular_weight, b.target, b.ic50_nm
FROM molecular_compounds c
JOIN bioactivity_data b ON c.id = b.compound_id
WHERE b.ic50_nm < 1000 AND b.activity_type = 'IC50'
ORDER BY b.ic50_nm ASC
LIMIT 50;`,
  },
];

// ============ QUERY EXECUTOR PAGE ============

export default function QueryExecutorPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState(sampleQueries[0].sql);
  const [results, setResults] = useState<QueryResult | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Execute query simulation
  const executeQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    setError(null);
    
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    try {
      // Generate mock results based on query content
      let mockResult: QueryResult;

      if (query.toLowerCase().includes('publications')) {
        mockResult = {
          columns: ['title', 'authors', 'year', 'citations', 'journal'],
          rows: Array.from({ length: 20 }, (_, i) => ({
            title: `Research Paper Title ${i + 1}: Advances in ${['Genomics', 'Proteomics', 'Drug Discovery', 'Machine Learning'][i % 4]}`,
            authors: `Smith J, Johnson A${i > 5 ? ', Williams M' : ''}`,
            year: 2024 - (i % 5),
            citations: 500 - i * 20 + Math.floor(Math.random() * 50),
            journal: ['Nature Methods', 'Bioinformatics', 'Cell Systems', 'PNAS'][i % 4],
          })),
        };
      } else if (query.toLowerCase().includes('genomic') || query.toLowerCase().includes('gene')) {
        mockResult = {
          columns: ['gene_name', 'organism', 'sequence_length', 'gc_content', 'chromosome'],
          rows: Array.from({ length: 15 }, (_, i) => ({
            gene_name: `GENE_${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ''}`,
            organism: 'Homo sapiens',
            sequence_length: 1500 + Math.floor(Math.random() * 50000),
            gc_content: parseFloat((45 + Math.random() * 30).toFixed(2)),
            chromosome: `Chr ${(i % 22) + 1}`,
          })),
        };
      } else if (query.toLowerCase().includes('compound') || query.toLowerCase().includes('molecular')) {
        mockResult = {
          columns: ['name', 'molecular_weight', 'target', 'ic50_nm'],
          rows: Array.from({ length: 12 }, (_, i) => ({
            name: `Compound-${String(i + 1).padStart(3, '0')}`,
            molecular_weight: parseFloat((200 + Math.random() * 600).toFixed(2)),
            target: ['EGFR', 'BRCA1', 'TP53', 'BRAF', 'KRAS', 'PI3K'][i % 6],
            ic50_nm: parseFloat((10 + Math.random() * 990).toFixed(1)),
          })),
        };
      } else {
        // Generic result
        mockResult = {
          columns: ['id', 'name', 'value', 'category'],
          rows: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`,
            value: Math.floor(Math.random() * 1000),
            category: ['A', 'B', 'C'][i % 3],
          })),
        };
      }

      setResults(mockResult);
      setExecutionTime(parseFloat((0.8 + Math.random() * 1.2).toFixed(3)));
    } catch {
      setError('Query execution failed. Please check your syntax.');
    }

    setIsExecuting(false);
  };

  // Load sample query
  const loadSampleQuery = (sample: typeof sampleQueries[0]) => {
    setQuery(sample.sql);
    setError(null);
  };

  // Insert table name at cursor position
  const insertTableName = (tableName: string) => {
    setQuery(prev => prev + tableName);
    setSelectedTable(tableName);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-2">
        <h1 className="text-lg font-semibold">{t('query.title')}</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Query Editor */}
        <div className="w-1/2 flex flex-col border-r">
          {/* Sample Queries */}
          <div className="p-3 border-b bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
              {t('query.saved_queries')}
            </span>
            <div className="flex gap-2 flex-wrap">
              {sampleQueries.map((sq, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  onClick={() => loadSampleQuery(sq)}
                  className="text-xs"
                >
                  {sq.name}
                </Button>
              ))}
            </div>
          </div>

          {/* SQL Editor */}
          <div className="flex-1 p-3">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('query.write_query')}
              className="w-full h-full font-mono text-sm resize-none"
              spellCheck={false}
            />
          </div>

          {/* Table Browser */}
          <div className="border-t p-3">
            <span className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
              Tables
            </span>
            <div className="flex gap-2 flex-wrap">
              {mockTables.map(table => (
                <Badge
                  key={table.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => insertTableName(table.name)}
                >
                  {table.name} ({(table.rowCount / 1000000).toFixed(0)}M)
                </Badge>
              ))}
            </div>
          </div>

          {/* Execute Button */}
          <div className="border-t p-3 bg-muted/20">
            <Button 
              onClick={executeQuery} 
              disabled={isExecuting || !query.trim()}
              className="w-full"
            >
              {isExecuting ? '⏱ Executing...' : `▶ ${t('query.execute')}`}
            </Button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="w-1/2 flex flex-col">
          <Tabs defaultValue="results" className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="results" className="flex-1">
                {t('query.results')}
                {results && ` (${results.rows.length})`}
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex-1">
                {t('query.execution_plan')}
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">
                {t('query.statistics')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="flex-1 overflow-auto p-4">
              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-medium">{t('query.query_error')}</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              ) : results ? (
                <>
                  {/* Stats Bar */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{t('query.rows_returned')}: <strong className="text-foreground">{results.rows.length}</strong></span>
                      {executionTime !== null && (
                        <span>{t('query.query_time')}: <strong className="text-foreground">{executionTime}s</strong></span>
                      )}
                    </div>
                    <Button size="sm" variant="outline">Export CSV</Button>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">#</th>
                          {results.columns.map(col => (
                            <th key={col} className="px-3 py-2 text-left font-medium">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.map((row, idx) => (
                          <tr key={idx} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                            {results.columns.map(col => (
                              <td key={col} className="px-3 py-2 max-w-[200px] truncate">
                                {String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t('query.no_results')}
                </div>
              )}
            </TabsContent>

            <TabsContent value="plan" className="flex-1 p-4">
              <div className="space-y-3">
                {[
                  { step: 1, operation: 'Seq Scan', table: results?.columns.includes('title') ? 'publications' : 'genomic_sequences', cost: 1250.50, rows: results?.rows.length || 100 },
                  { step: 2, operation: 'Sort', table: '-', cost: 45.20, rows: results?.rows.length || 100 },
                  { step: 3, operation: 'Limit', table: '-', cost: 0.01, rows: results?.rows.length || 100 },
                ].map(plan => (
                  <Card key={plan.step}>
                    <CardContent className="p-3 flex items-center gap-4">
                      <Badge variant="outline">{plan.step}</Badge>
                      <span className="font-medium w-24">{plan.operation}</span>
                      <span className="text-muted-foreground w-40">{plan.table}</span>
                      <span className="text-sm ml-auto">Cost: {plan.cost.toFixed(2)}</span>
                      <Badge variant="secondary">{plan.rows} rows</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Execution Time</p>
                    <p className="text-2xl font-bold">{executionTime || '-'}s</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Rows Returned</p>
                    <p className="text-2xl font-bold">{results?.rows.length || '-'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Columns</p>
                    <p className="text-2xl font-bold">{results?.columns.length || '-'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold text-green-500">
                      {error ? 'Error' : results ? 'Success' : '-'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
