'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

// ============ TYPES ============

interface Dataset {
  id: string;
  name: string;
  description: string;
  size: string;
  rows: number;
  columns: number;
  type: 'tabular' | 'sequence' | 'image' | 'text' | 'structural';
  format: string;
  source: string;
  lastModified: Date;
  tags: string[];
  isPublic: boolean;
}

// ============ SAMPLE DATASETS (with realistic scientific data) ============

const sampleDatasets: Dataset[] = [
  {
    id: 'ds-001',
    name: 'TCGA Breast Cancer Expression',
    description: 'RNA-Seq gene expression data from TCGA breast cancer cohort (BRCA). Contains normalized counts for ~20,000 genes across 1,100 samples.',
    size: '245 MB',
    rows: 1100,
    columns: 20000,
    type: 'tabular',
    format: 'CSV / Parquet',
    source: 'NCBI GEO (GSE62944)',
    lastModified: new Date('2024-01-15'),
    tags: ['cancer', 'gene-expression', 'tcga', 'breast-cancer'],
    isPublic: true,
  },
  {
    id: 'ds-002',
    name: 'Human Protein Atlas - Tissue',
    description: 'Tissue-specific protein expression levels across human tissues. RNA and protein abundance data for all protein-coding genes.',
    size: '128 MB',
    rows: 19264,
    columns: 78,
    type: 'tabular',
    format: 'TSV / HDF5',
    source: 'Human Protein Atlas v22.0',
    lastModified: new Date('2024-02-20'),
    tags: ['proteomics', 'tissue', 'expression', 'human'],
    isPublic: true,
  },
  {
    id: 'ds-003',
    name: 'ChEMBL Bioactivity Data',
    description: 'Curated bioactivity data for drug-like molecules. Contains IC50, Ki, Kd values against various protein targets.',
    size: '512 MB',
    rows: 2400000,
    columns: 45,
    type: 'tabular',
    format: 'Parquet / SQLite',
    source: 'ChEMBL 33',
    lastModified: new Date('2024-03-01'),
    tags: ['drug-discovery', 'bioactivity', 'cheminformatics'],
    isPublic: true,
  },
  {
    id: 'ds-004',
    name: 'PDB Structural Database Subset',
    description: 'High-resolution (<2.0Å) protein structures with annotated binding sites and ligand information.',
    size: '1.8 GB',
    rows: 45000,
    columns: 32,
    type: 'structural',
    format: 'MMTF / PDB',
    source: 'RCSB PDB',
    lastModified: new Date('2024-02-28'),
    tags: ['protein-structure', 'binding-sites', '3d-structure'],
    isPublic: true,
  },
  {
    id: 'ds-005',
    name: 'Genomic Variants - gnomAD v3',
    description: 'Population genome variant frequencies from gnomAD. Includes allele frequencies across multiple populations.',
    size: '3.2 GB',
    rows: 250000000,
    columns: 18,
    type: 'tabular',
    format: 'BCF / Parquet',
    source: 'gnomAD v3.1.2',
    lastModified: new Date('2024-01-10'),
    tags: ['genomics', 'variants', 'population', 'gnomad'],
    isPublic: true,
  },
  {
    id: 'ds-006',
    name: 'arXiv ML Papers Metadata',
    description: 'Metadata for machine learning papers from arXiv (cs.LG, cs.CL, stat.ML categories) with abstracts and citation info.',
    size: '89 MB',
    rows: 185000,
    columns: 24,
    type: 'text',
    format: 'JSON / Parquet',
    source: 'arXiv API / OpenAlex',
    lastModified: new Date('2024-03-05'),
    tags: ['machine-learning', 'papers', 'nlp', 'metadata'],
    isPublic: true,
  },
];

// ============ DATA LAKE PAGE ============

export default function DataLakePage() {
  const { t } = useTranslation();
  const [datasets, setDatasets] = useState<Dataset[]>(sampleDatasets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [viewMode, viewModeSet] = useState<'grid' | 'table'>('grid');

  // Filter datasets
  const filteredDatasets = datasets.filter(ds =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
  );

  // Calculate total storage
  const totalStorage = datasets.reduce((acc, ds) => {
    const size = parseFloat(ds.size);
    return acc + (isNaN(size) ? 0 : size);
  }, 0);

  const getTypeIcon = (type: Dataset['type']) => {
    switch (type) {
      case 'tabular': return '📊';
      case 'sequence': return '🧬';
      case 'image': return '🖼️';
      case 'text': return '📝';
      case 'structural': return '🔷';
      default: return '📁';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('data.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('data.subtitle')}</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <p className="text-sm text-muted-foreground">{t('data.my_datasets')}</p>
              <p className="text-xl font-bold">{datasets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <p className="text-sm text-muted-foreground">Total Storage</p>
              <p className="text-xl font-bold">{totalStorage.toFixed(1)} GB</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-sm text-muted-foreground">Total Rows</p>
              <p className="text-xl font-bold">{formatNumber(datasets.reduce((a, d) => a + d.rows, 0))}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <p className="text-sm text-muted-foreground">{t('data.public_datasets')}</p>
              <p className="text-xl font-bold text-green-500">{datasets.filter(d => d.isPublic).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder={t('data.search_datasets') || 'Search datasets...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => viewModeSet('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => viewModeSet('table')}
          >
            Table
          </Button>
          <Button size="sm" variant="secondary">
            + {t('data.upload_dataset')}
          </Button>
          <Button size="sm" variant="outline">
            {t('data.import_from_url')}
          </Button>
        </div>
      </div>

      {/* Datasets Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map(dataset => (
            <Card 
              key={dataset.id} 
              className={`cursor-pointer hover:shadow-lg transition-all ${
                selectedDataset?.id === dataset.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedDataset(dataset)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(dataset.type)}</span>
                    <div>
                      <CardTitle className="text-base">{dataset.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dataset.source}
                      </p>
                    </div>
                  </div>
                  {dataset.isPublic && (
                    <Badge variant="secondary" className="text-xs">Public</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {dataset.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="font-medium">{t('data.rows', { count: formatNumber(dataset.rows) })}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="font-medium">{t('data.columns', { count: dataset.columns })}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="font-medium">{t('data.file_size', { size: dataset.size })}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {dataset.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1">
                    {t('data.preview')}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    {t('data.download')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Rows</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Size</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Source</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">{t('data.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDatasets.map(dataset => (
                  <tr key={dataset.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{getTypeIcon(dataset.type)}</span>
                        <span className="font-medium">{dataset.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{dataset.format}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatNumber(dataset.rows)}</td>
                    <td className="px-4 py-3 text-sm">{dataset.size}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{dataset.source}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">{t('data.preview')}</Button>
                        <Button size="sm" variant="ghost">{t('data.download')}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {filteredDatasets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('data.no_datasets')}</p>
        </div>
      )}
    </div>
  );
}
