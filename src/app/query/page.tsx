'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore, createDynamicField } from '@/store/useDynamicStore';
import { 
  executeSimulatedQuery, 
  resultToCSV, 
  resultToJSON,
  MOCK_SCHEMAS,
  TableSchema
} from '@/services/databaseSimulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============ TYPES ============

interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowsAffected: number;
  queryPlan?: QueryPlanStep[];
  fromCache: boolean;
  provider: string;
}

interface QueryPlanStep {
  step: number;
  operation: string;
  table?: string;
  estimatedRows?: number;
  actualRows?: number;
  timeMs: number;
}

// ============ SAMPLE QUERIES ============

const SAMPLE_QUERIES = [
  {
    id: 'query-1',
    name: 'Top Cited Papers',
    sql: `SELECT 
    title,
    authors,
    year,
    citations,
    journal,
    doi
FROM publications
WHERE field IN ('Bioinformatics', 'Genomics')
    AND year >= 2020
ORDER BY citations DESC
LIMIT 20;`,
    description: 'Find highly cited papers in bioinformatics and genomics'
  },
  {
    id: 'query-2',
    name: 'High GC Content Genes',
    sql: `SELECT 
    accession,
    organism,
    gene_name,
    sequence_length,
    gc_content,
    chromosome
FROM genomic_sequences
WHERE gc_content > 60
    AND organism LIKE '%sapiens%'
ORDER BY gc_content DESC
LIMIT 50;`,
    description: 'Identify genes with high GC content in human genome'
  },
  {
    id: 'query-3',
    name: 'Active Compounds',
    sql: `SELECT 
    c.name AS compound_name,
    c.smiles,
    c.molecular_weight,
    b.target_protein,
    b.activity_type,
    b.ic50_nm,
    CASE 
        WHEN b.ic50_nm < 100 THEN 'Potent'
        WHEN b.ic50_nm < 1000 THEN 'Moderate'
        ELSE 'Weak'
    END AS potency_class
FROM molecular_compounds c
JOIN bioactivity_data b ON c.id = b.compound_id
WHERE b.ic50_nm < 1000
ORDER BY b.ic50_nm ASC
LIMIT 30;`,
    description: 'Query compounds with high bioactivity against targets'
  },
];

// ============ QUERY EXECUTOR PAGE ============

export default function QueryExecutorPage() {
  const { t } = useTranslation();
  const {
    queryHistory,
    addQueryToHistory,
    clearQueryHistory,
    addActivity,
    dbConfig,
  } = useDynamicStore();

  // UI State
  const [sqlQuery, setSqlQuery] = useState(SAMPLE_QUERIES[0].sql);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState(dbConfig.provider);
  const [showHistory, setShowHistory] = useState(false);

  // Execute SQL Query
  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return;

    setIsExecuting(true);
    setError(null);
    setCurrentResult(null);
    setExecutionProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => Math.min(prev + 10 + Math.random() * 15, 90));
      }, 200);

      // Execute query using database simulation
      const result = await executeSimulatedQuery(sqlQuery, selectedProvider);
      
      clearInterval(progressInterval);
      setExecutionProgress(100);

      // Small delay for UI update
      await new Promise(resolve => setTimeout(resolve, 200));

      setCurrentResult(result);
      
      // Add to history
      addQueryToHistory(
        sqlQuery.trim(),
        result.rows,
        result.executionTimeMs,
        selectedProvider
      );

      // Log activity
      addActivity({
        type: 'query',
        message: createDynamicField(
          `Executed query on ${selectedProvider}: ${result.rowsAffected} rows (${result.executionTimeMs.toFixed(0)}ms)`
        ),
        icon: '🔍',
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
      console.error('Query error:', err);
    } finally {
      setIsExecuting(false);
      setExecutionProgress(0);
    }
  };

  // Load sample query
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_QUERIES.find(q => q.id === sampleId);
    if (sample) {
      setSqlQuery(sample.sql);
    }
  };

  // Load query from history
  const handleLoadFromHistory = (historyIndex: number) => {
    const entry = queryHistory[historyIndex];
    if (entry) {
      setSqlQuery(entry.query.value);
      setShowHistory(false);
    }
  };

  // Export results
  const handleExportResults = (format: 'csv' | 'json') => {
    if (!currentResult) return;

    const content = format === 'csv' ? resultToCSV(currentResult) : resultToJSON(currentResult);
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    addActivity({
      type: 'export',
      message: createDynamicField(`Exported query results as ${format.toUpperCase()}`),
      icon: '📥',
    });
  };

  // Generate table schema preview
  const getTablePreview = (schema: TableSchema) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{schema.name}</span>
        <Badge variant="secondary" className="text-xs">
          {schema.rowCount.toLocaleString()} rows
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground">
        {schema.columns.slice(0, 4).map(col => col.name).join(', ')}
        {schema.columns.length > 4 && ` ... +${schema.columns.length - 4} more`}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('query.title') || 'Query Executor'}</h1>
        <p className="text-muted-foreground mt-1">
          Execute SQL queries against scientific databases. Free-tier DuckDB/PostgreSQL simulation included.
        </p>
        
        <div className="mt-2 flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            🆓 Free Tier Queries
          </Badge>
          <span className="text-sm text-muted-foreground">
            Provider: <strong className="capitalize">{selectedProvider}</strong>
          </span>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="duckdb">🦆 DuckDB</SelectItem>
              <SelectItem value="sqlite">🗄️ SQLite</SelectItem>
              <SelectItem value="postgresql_supabase">⚡ Supabase</SelectItem>
              <SelectItem value="postgresql_neon">🌩️ Neon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Editor & Tables */}
        <div className="lg:col-span-3 space-y-6">
          {/* SQL Editor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">SQL Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={currentResult?.fromCache ? 'default' : 'secondary'} className="text-xs">
                    {currentResult?.fromCache ? '📦 From Cache' : 'Live Query'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setShowHistory(!showHistory)}>
                    📜 History ({queryHistory.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample Queries */}
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUERIES.map(sample => (
                  <Button
                    key={sample.id}
                    size="sm"
                    variant={sqlQuery === sample.sql ? 'default' : 'outline'}
                    onClick={() => handleLoadSample(sample.id)}
                    className="text-xs"
                  >
                    {sample.name}
                  </Button>
                ))}
              </div>

              {/* Query Textarea */}
              <div className="relative border rounded-lg overflow-hidden">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-48 p-4 pl-12 font-mono text-sm bg-background resize-none focus:outline-none"
                  spellCheck={false}
                  placeholder="Enter your SQL query here..."
                  style={{ tabSize: 2 }}
                />
                
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-muted/30 pointer-events-none flex flex-col items-end pr-2 pt-4 text-xs text-muted-foreground font-mono select-none">
                  {sqlQuery.split('\n').map((_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                </div>
                
                {/* Execute Button */}
                <div className="absolute bottom-3 right-3">
                  <Button 
                    onClick={handleExecuteQuery} 
                    disabled={isExecuting || !sqlQuery.trim()}
                    size="sm"
                  >
                    {isExecuting ? (
                      <>▶ Executing... {Math.round(executionProgress)}%</>
                    ) : (
                      '▶ Execute Query'
                    )}
                  </Button>
                </div>
              </div>

              {/* Execution Progress */}
              {isExecuting && (
                <Progress value={executionProgress} className="h-2" />
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Query Error:</p>
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
                </div>
              )}

              {/* Query History Dropdown */}
              {showHistory && (
                <div className="border rounded-lg p-3 max-h-48 overflow-auto">
                  <h4 className="font-medium text-sm mb-2">Recent Queries</h4>
                  {queryHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No query history yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {queryHistory.slice(0, 10).map((entry, idx) => (
                        <button
                          key={entry.id}
                          onClick={() => handleLoadFromHistory(idx)}
                          className="w-full text-left p-2 rounded hover:bg-muted transition-colors text-xs"
                        >
                          <div className="font-medium truncate">{entry.query.value.substring(0, 80)}...</div>
                          <div className="text-muted-foreground mt-1">
                            {entry.rowsAffected.value} rows • {entry.executionTime.value.toFixed(0)}ms • {entry.dataSource}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {queryHistory.length > 0 && (
                    <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={clearQueryHistory}>
                      Clear History
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Tabs defaultValue="results">
            <TabsList>
              <TabsTrigger value="results">
                Results {currentResult && `(${currentResult.rows.length})`}
              </TabsTrigger>
              <TabsTrigger value="plan">Execution Plan</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="mt-4">
              {currentResult ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Query Results</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {currentResult.rowsAffected} rows • {currentResult.executionTimeMs.toFixed(0)}ms
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleExportResults('csv')}>
                          📥 CSV
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleExportResults('json')}>
                          📋 JSON
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto max-h-96 border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/95 backdrop-blur">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium border-b bg-muted">#</th>
                            {currentResult.columns.map((col) => (
                              <th key={col} className="px-4 py-2 text-left font-medium border-b">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentResult.rows.map((row, idx) => (
                            <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                              {currentResult.columns.map((col) => (
                                <td key={col} className="px-4 py-2 max-w-[300px] truncate">
                                  {row[col] !== undefined && row[col] !== null 
                                    ? String(row[col]) 
                                    : <span className="text-muted-foreground">NULL</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {currentResult.rows.length > 100 && (
                      <p className="text-sm text-muted-foreground mt-3 text-center">
                        Showing first 100 of {currentResult.rowsAffected} rows
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <span className="text-5xl block mb-4">🔍</span>
                    <p>Execute a query to see results here</p>
                    <p className="text-sm mt-2">Try one of the sample queries above or write your own SQL</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="plan" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Query Execution Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentResult?.queryPlan ? (
                    <div className="space-y-3">
                      {currentResult.queryPlan.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                          <Badge variant="outline" className="mt-0.5">
                            Step {step.step}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium">{step.operation}</p>
                            {step.table && (
                              <p className="text-sm text-muted-foreground">Table: {step.table}</p>
                            )}
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                              {step.estimatedRows && (
                                <span>Est. rows: {step.estimatedRows.toLocaleString()}</span>
                              )}
                              {step.actualRows && (
                                <span>Actual rows: {step.actualRows.toLocaleString()}</span>
                              )}
                              <span>Time: {step.timeMs.toFixed(2)}ms</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-3 border-t">
                        <p className="text-sm">
                          Total execution time: <strong>{currentResult.executionTimeMs.toFixed(0)}ms</strong>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Provider: {currentResult.provider} • Cache hit: {currentResult.fromCache ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Execute a query to see its execution plan
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Query Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentResult ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Rows Returned" value={currentResult.rowsAffected.toLocaleString()} icon="📊" />
                      <StatCard label="Columns" value={currentResult.columns.length.toString()} icon="📋" />
                      <StatCard label="Execution Time" value={`${currentResult.executionTimeMs.toFixed(0)}ms`} icon="⏱️" />
                      <StatCard label="Cache Hit" value={currentResult.fromCache ? 'Yes' : 'No'} icon={currentResult.fromCache ? '✅' : '❌'} />
                      <StatCard label="Provider" value={currentResult.provider} icon="🗄️" />
                      <StatCard label="Data Size" value={`${(JSON.stringify(currentResult.rows).length / 1024).toFixed(1)} KB`} icon="💾" />
                      <StatCard label="Timestamp" value={new Date().toLocaleTimeString()} icon="🕐" />
                      <StatCard label="Status" value="Success" icon="✨" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No statistics available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Table Browser */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Table Browser</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Click a table to view schema or insert into editor
              </p>
              
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {MOCK_SCHEMAS.map(schema => (
                  <button
                    key={schema.name}
                    onClick={() => {
                      setSelectedTable(schema.name);
                      setSqlQuery(`SELECT * FROM ${schema.name} LIMIT 50;`);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTable === schema.name 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    {getTablePreview(schema)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Queries Run</span>
                <span className="font-medium">{queryHistory.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Rows Fetched</span>
                <span className="font-medium">
                  {queryHistory.reduce((acc, q) => acc + q.rowsAffected.value, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Execution Time</span>
                <span className="font-medium">
                  {queryHistory.length > 0 
                    ? `${(queryHistory.reduce((acc, q) => acc + q.executionTime.value, 0) / queryHistory.length).toFixed(0)}ms`
                    : '-'
                  }
                </span>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  if (confirm('Clear all query history?')) {
                    clearQueryHistory();
                  }
                }}
                disabled={queryHistory.length === 0}
              >
                Clear History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 text-center">
      <span className="text-xl block mb-1">{icon}</span>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
