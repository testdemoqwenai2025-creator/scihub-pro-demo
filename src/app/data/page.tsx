'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore, createDynamicField } from '@/store/useDynamicStore';
import { executeSimulatedQuery, resultToCSV, resultToJSON, getFreeTierInfo } from '@/services/databaseSimulation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataLakeSkeleton, CardSkeleton, StatsCardSkeleton } from '@/components/SkeletonComponents';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/lib/toast-utils';

// ============ TYPES ============

interface DatasetFormData {
  name: string;
  description: string;
  type: string;
  format: string;
  sourceUrl: string;
  tags: string[];
  isPublic: boolean;
}

// ============ DATA LAKE PAGE ============

export default function DataLakePage() {
  const { t } = useTranslation();
  const {
    datasets,
    createDataset,
    updateDataset,
    deleteDataset,
    getTotalStorage,
    addActivity,
    checkVolumeThreshold,
    dbConfig,
  } = useDynamicStore();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
  const [tempValue, setTempValue] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<DatasetFormData>({
    name: '',
    description: '',
    type: 'Genomics',
    format: 'CSV',
    sourceUrl: '',
    tags: [],
    isPublic: true,
  });

  // Volume threshold
  const [volumeStatus, setVolumeStatus] = useState(checkVolumeThreshold());
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Check volume periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setVolumeStatus(checkVolumeThreshold());
    }, 10000);
    return () => clearInterval(interval);
  }, [checkVolumeThreshold]);

  // Filter datasets
  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = 
      dataset.name.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.value.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Storage calculations
  const totalStorageMB = (getTotalStorage() / 1024 / 1024).toFixed(2);
  const totalRows = datasets.reduce((acc, ds) => acc + ds.rows.value, 0);
  const publicCount = datasets.filter(ds => ds.isPublic.value).length;

  // Handle dataset creation
  const handleCreateDataset = async () => {
    if (!formData.name.trim()) return;

    setIsUploading(true);
    setUploadProgress(0);
    showLoadingToast('Creating Dataset...', `Uploading "${formData.name}"`);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    const datasetSize = (Math.random() * 500 + 50).toFixed(1);
    
    createDataset({
      name: createDynamicField(formData.name),
      description: createDynamicField(formData.description || `Dataset: ${formData.name}`),
      size: createDynamicField(`${datasetSize} MB`),
      rows: createDynamicField(Math.floor(Math.random() * 1000000 + 10000)),
      columns: createDynamicField(Math.floor(Math.random() * 100 + 10)),
      type: createDynamicField(formData.type),
      format: createDynamicField(formData.format),
      sourceUrl: createDynamicField(formData.sourceUrl || '#'),
      tags: createDynamicField(formData.tags.length > 0 ? formData.tags : ['user-uploaded']),
      isPublic: createDynamicField(formData.isPublic),
      storageLocation: volumeStatus.exceeded ? 'duckdb' : 'local',
    });

    setIsUploading(false);
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      type: 'Genomics',
      format: 'CSV',
      sourceUrl: '',
      tags: [],
      isPublic: true,
    });

    addActivity({
      type: 'upload',
      message: createDynamicField(`Uploaded dataset "${formData.name}"`),
      icon: '📊',
    });
    
    showSuccessToast('Dataset Created!', `Upload completed! File size: ${datasetSize} MB`);
  };

  // Handle dataset deletion
  const handleDeleteDataset = (id: string) => {
    const dataset = datasets.find(d => d.id === id);
    if (dataset && confirm(`Delete "${dataset.name.value}"? This action cannot be undone.`)) {
      deleteDataset(id);
      setSelectedDataset(null);
      showInfoToast('Dataset Deleted', `"${dataset.name.value}" has been removed`);
    }
  };

  // Handle inline editing
  const startEditing = (id: string, field: string, currentValue: any) => {
    setEditingField({ id, field });
    setTempValue(String(currentValue));
  };

  const saveEdit = (id: string, field: string) => {
    updateDataset(id, {
      [field]: {
        ...datasets.find(d => d.id === id)?.[field as keyof typeof datasets[0]],
        value: tempValue,
        isDirty: true,
        lastModified: new Date(),
      }
    });
    setEditingField(null);
  };

  // Query dataset with DuckDB simulation
  const handleQueryDataset = async (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (!dataset) return;

    try {
      const sql = `SELECT * FROM ${dataset.name.value.replace(/\s+/g, '_').toLowerCase()} LIMIT 20`;
      const result = await executeSimulatedQuery(sql, dataset.storageLocation);
      
      addActivity({
        type: 'query',
        message: createDynamicField(`Queried ${dataset.name.value}: ${result.rows.length} rows returned`),
        icon: '🔍',
      });

      // Could open results in a modal or navigate to query page
      console.log('Query Result:', result);
    } catch (error) {
      console.error('Query failed:', error);
    }
  };

  // Export dataset
  const handleExportDataset = async (datasetId: string, format: 'csv' | 'json') => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (!dataset) return;

    // Generate mock export data
    const mockResult = await executeSimulatedQuery(
      `SELECT * FROM ${dataset.name.value.replace(/\s+/g, '_').toLowerCase()} LIMIT 100`
    );

    const content = format === 'csv' ? resultToCSV(mockResult) : resultToJSON(mockResult);
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name.value}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    addActivity({
      type: 'export',
      message: createDynamicField(`Exported ${dataset.name.value} as ${format.toUpperCase()}`),
      icon: '📥',
    });
    
    showSuccessToast('Export Complete', `${dataset.name.value} exported as ${format.toUpperCase()}`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DataLakeSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('data.title') || 'Data Lake Browser'}</h1>
        <p className="text-muted-foreground mt-1">
          Browse, manage, and analyze scientific datasets. All data stored locally or pushed to free-tier databases.
        </p>
        
        {/* Free Tier Info */}
        <div className="mt-3 flex items-center gap-3 text-sm">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            🆓 Free Tier Active
          </Badge>
          <span className="text-muted-foreground">
            DuckDB • IndexedDB • localStorage
          </span>
          {volumeStatus.shouldPush && (
            <Badge variant="outline" className="border-yellow-400 text-yellow-600 animate-pulse">
              ⚠️ Approaching storage limit
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-3">
          <Input
            placeholder="Search datasets by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'table')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid View</SelectItem>
              <SelectItem value="table">Table View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          + Upload Dataset
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-xs text-muted-foreground">Total Datasets</p>
              <p className="text-xl font-bold">{datasets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <p className="text-xs text-muted-foreground">Total Size</p>
              <p className="text-xl font-bold">{totalStorageMB} MB</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="text-xs text-muted-foreground">Total Rows</p>
              <p className="text-xl font-bold">{totalRows.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <p className="text-xs text-muted-foreground">Public</p>
              <p className="text-xl font-bold text-green-500">{publicCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">{dbConfig.provider === 'duckdb' ? '🦆' : '🐘'}</span>
            <div>
              <p className="text-xs text-muted-foreground">Storage Engine</p>
              <p className="text-lg font-bold capitalize">{dbConfig.provider}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dataset Form */}
      {showCreateForm && (
        <Card className="mb-8 border-primary">
          <CardHeader>
            <CardTitle>Upload New Dataset</CardTitle>
            <CardDescription>
              Fill in the details below. Your data will be stored using the configured database provider.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Dataset Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., TCGA Expression Matrix"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Genomics">Genomics</SelectItem>
                    <SelectItem value="Proteomics">Proteomics</SelectItem>
                    <SelectItem value="Chemical Biology">Chemical Biology</SelectItem>
                    <SelectItem value="Structural Biology">Structural Biology</SelectItem>
                    <SelectItem value="Literature">Literature</SelectItem>
                    <SelectItem value="Clinical">Clinical Data</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the dataset..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Format</label>
                <Select value={formData.format} onValueChange={(v) => setFormData({...formData, format: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="Parquet">Parquet</SelectItem>
                    <SelectItem value="HDF5">HDF5</SelectItem>
                    <SelectItem value="VCF">VCF/BCF</SelectItem>
                    <SelectItem value="FASTA">FASTA</SelectItem>
                    <SelectItem value="mmCIF">mmCIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Source URL</label>
                <Input
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleCreateDataset} disabled={!formData.name.trim() || isUploading}>
                {isUploading ? '⏳ Uploading...' : '📤 Upload Dataset'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Datasets Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <Card 
              key={dataset.id} 
              className={`hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer ${
                selectedDataset === dataset.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedDataset(dataset.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingField?.id === dataset.id && editingField.field === 'name' ? (
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveEdit(dataset.id, 'name')}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(dataset.id, 'name')}
                        className="h-7 text-lg font-medium"
                        autoFocus
                      />
                    ) : (
                      <CardTitle 
                        className="text-lg truncate"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startEditing(dataset.id, 'name', dataset.name.value);
                        }}
                        title="Double-click to edit"
                      >
                        {dataset.name.value}
                        {dataset.name.isDirty && <span className="ml-1 text-orange-500">✏️</span>}
                      </CardTitle>
                    )}
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {dataset.description.value}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      {dataset.type.value}
                    </Badge>
                    <Badge variant={dataset.isPublic.value ? 'default' : 'secondary'} className="text-xs">
                      {dataset.isPublic.value ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span>📦</span>
                    <span>{dataset.size.value}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📊</span>
                    <span>{dataset.rows.value.toLocaleString()} rows</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📋</span>
                    <span>{dataset.columns.value} cols</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🏷️</span>
                    <span>{dataset.format.value}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {dataset.tags.value.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {dataset.tags.value.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dataset.tags.value.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Storage Location */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Storage:</span>
                    <Badge variant="outline" className="text-xs">
                      {dataset.storageLocation === 'duckdb' && '🦆 DuckDB'}
                      {dataset.storageLocation === 'postgres' && '🐘 PostgreSQL'}
                      {dataset.storageLocation === 'indexeddb' && '🗄️ IndexedDB'}
                      {dataset.storageLocation === 'local' && '💾 Local'}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQueryDataset(dataset.id);
                    }}
                  >
                    🔍 Query
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportDataset(dataset.id, 'csv');
                    }}
                  >
                    📥 CSV
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDataset(dataset.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    🗑️
                  </Button>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground pt-1">
                  Modified: {dataset.lastModified.toLocaleDateString()}
                  {' • '}
                  Downloads: {dataset.downloadCount}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-right font-medium">Size</th>
                    <th className="px-4 py-3 text-right font-medium">Rows</th>
                    <th className="px-4 py-3 text-left font-medium">Format</th>
                    <th className="px-4 py-3 text-left font-medium">Storage</th>
                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDatasets.map((dataset) => (
                    <tr key={dataset.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium truncate max-w-[200px]">
                            {dataset.name.value}
                            {dataset.name.isDirty && <span className="ml-1 text-orange-500">✏️</span>}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {dataset.description.value}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {dataset.type.value}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">{dataset.size.value}</td>
                      <td className="px-4 py-3 text-right">{dataset.rows.value.toLocaleString()}</td>
                      <td className="px-4 py-3">{dataset.format.value}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {dataset.storageLocation}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleQueryDataset(dataset.id)}>🔍</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleExportDataset(dataset.id, 'csv')}>📥</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteDataset(dataset.id)}>🗑️</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredDatasets.length === 0 && !showCreateForm && (
        <div className="text-center py-16">
          <span className="text-6xl block mb-4">📂</span>
          <h3 className="text-lg font-medium mb-2">No datasets found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Upload your first dataset to get started'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateForm(true)}>
              + Upload Dataset
            </Button>
          )}
        </div>
      )}

      {/* Database Info Panel */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">🗄️ Database & Storage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">DuckDB (Analytical)</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• In-process OLAP queries</li>
                <li>• Columnar storage format</li>
                <li>• Unlimited storage (disk-based)</li>
                <li>• Perfect for large analytics</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">IndexedDB (Browser)</h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Client-side persistence</li>
                <li>• ~250MB typical limit</li>
                <li>• Async operations</li>
                <li>• Good for caching</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">localStorage (Session)</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• ~5-10MB capacity</li>
                <li>• Synchronous access</li>
                <li>• User preferences</li>
                <li>• Quick state recovery</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Auto-Push Threshold</h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Current: {(dbConfig.autoPushThreshold.value / 1024 / 1024).toFixed(0)} MB</li>
                <li>• Used: {totalStorageMB} MB</li>
                <li>• Status: {volumeStatus.exceeded ? 'Exceeded' : volumeStatus.shouldPush ? 'Warning' : 'Normal'}</li>
                <li>• Provider: {dbConfig.provider}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
